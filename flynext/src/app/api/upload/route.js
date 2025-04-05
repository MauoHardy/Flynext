import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload image
 *     description: Upload an image file
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`;
    
    // Create 'public/uploads' directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // For development, we'll save to the public directory
    // In production, use a cloud storage service like S3
    await writeFile(join(uploadDir, filename), buffer);
    
    const url = `/uploads/${filename}`;
    
    return Response.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { message: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
