import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FlyNext API Documentation',
            version: '1.0.0',
            description: 'API documentation for the FlyNext application',
        },
        servers: [
            {
                url: '/',
                description: 'Current server',
            },
        ],
    },
    apis: ['./src/app/api/**/*.js', './src/app/api/**/*.ts'],
};

const spec = swaggerJsdoc(options);

export default spec; 