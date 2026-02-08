const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SmartMediChain API',
            version: '1.0.0',
            description: 'A blockchain-based medical supply chain management system API',
            contact: {
                name: 'Viraj Samarasinghe',
                email: 'viraj@smartmedichain.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://135.235.193.242:3001',
                description: 'Development server'
            },
            {
                url: 'http://20.36.128.93:3001',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};