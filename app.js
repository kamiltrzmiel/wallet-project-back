import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { usersRouter } from './routes/userRoutes.js';
import { transactionRouter } from './routes/transactionRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './docs/swagger-docs.js';

export const app = express();
const logger = morgan;

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
app.use('/wallet', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', 'profound-hamster-010baa.netlify.app');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Access-Control-Allow-Origin, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  );

  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  const { status, message } = err;
  res.status(status).json({ message });
});
