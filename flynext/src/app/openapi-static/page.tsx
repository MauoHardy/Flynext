export default function OpenApiStatic() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
            <p>Please visit one of the following links to view the API documentation:</p>
            <ul className="list-disc ml-6 mt-4">
                <li className="mb-2">
                    <a href="/api-docs" className="text-blue-500 hover:underline">
                        API Documentation (/api-docs)
                    </a>
                </li>
                <li className="mb-2">
                    <a href="/openapi" className="text-blue-500 hover:underline">
                        OpenAPI Documentation (/openapi)
                    </a>
                </li>
                <li className="mb-2">
                    <a href="/api/swagger" className="text-blue-500 hover:underline">
                        Raw Swagger JSON (/api/swagger)
                    </a>
                </li>
            </ul>
        </div>
    );
} 