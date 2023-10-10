import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';

import { transRouter } from './routes/transactionRoute.js';
import { userRouter } from './routes/userRoutes.js';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' assert { type: 'json' };

export const app = express();
const logger = morgan;

const formLogger = app.get('env') === 'development' ? 'dev' : 'short';

// API docs
app.use('/wallet', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(logger(formLogger));
app.use(cors());
app.use(express.json());

//Routing
app.use('/api/users', userRouter);
app.use('/api/transactions', transRouter);
app.use(passport.initialize());

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});
