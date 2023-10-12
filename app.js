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

app.use(logger(formatsLogger));
app.use(
  cors({
    origin: 'https://modern-gold-fatigues.cyclic.app/api',
  })
);
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
