import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet API',
      version: '1.0.0',
      description: 'API for Wallet Application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        description: 'SwaggerHub API Auto Mocking',
        url: 'https://virtserver.swaggerhub.com/wallet/',
      },
    ],
  },
  apis: ['./routes/*.js'], // Ścieżka do plików zawierających adnotacje JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app) {
  app.use('/wallet', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
