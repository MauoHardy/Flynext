import { redirect } from 'next/navigation';

export default function OpenApiDocs() {
    redirect('/swagger-ui.html');
} 