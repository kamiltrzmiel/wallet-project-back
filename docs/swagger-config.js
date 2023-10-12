import dotenv from 'dotenv';
dotenv.config();

const LOCAL = 'http://localhost:3000';
const SERVER = process.env.SERVER_ADDRESS;

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quick Bucks Wallet API',
      version: '1.0.0',
      description: 'API documentation for My Wallet app',
    },
    servers: [
      {
        url: SERVER,
        description: 'Cyclic server',
      },
      {
        url: LOCAL,
        description: 'Local server',
      },
    ],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your Bearer token in the format "Bearer {token}"',
      },
    },
  },
  apis: ['../routes/*.js', '../controllers/*.js'],
};
