import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' assert { type: 'json' };
import { connectDB } from './db/db.js';
import { userRouter } from './routes/userRoutes.js';
import { transRouter } from './routes/transactionRoute.js';
import log4js from 'log4js';

export const app = express();

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: 'logs.log',
      maxLogSize: 3 * 1024 * 1024,
      backups: 3,
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});

const logger = log4js.getLogger();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// API docs
app.use('/wallet', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  const startTime = new Date();
  const separator = '----------------------\n';
  logger.info(separator);
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Request Body: ${JSON.stringify(req.body)}`);

  res.on('finish', () => {
    const responseTime = new Date() - startTime;
    logger.info(`Response Status: ${res.statusCode}`);
    logger.info(`Response Time: ${responseTime} ms`);
  });

  next();
});

//Routing
app.use('/api/users', userRouter);
app.use('/api/transactions', transRouter);

app.get('/api/heartbeat', (req, res) => {
  res.json({ status: 'ok' });
});
//Error handling middleware
app.use((err, req, res, next) => {
  // Check if the error is a known Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ errors });
  }

  //Handle other types of errors (including unhandled rejections)
  if (err) {
    logger.error(err.stack);
  }
  // Check if headers have already been sent, and if so, just close the response
  if (res.headersSent) {
    return res.end();
  }

  // Respond with a generic error message for any other type of error
  return res.status(500).json({
    error: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 3000;

async function startApp() {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
  }
}

startApp();
