import express from 'express';
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  filterTransactions,
  getAllCategories,
} from '../controllers/transactionCtrl.js';
import { ctrlTask } from '../assets/ctrlTask.js';
import { schemas } from '../models/transactions.js';
import { validateBody } from '../middlewares/validateBody.js';
import { validateId } from '../middlewares/validateId.js';
import { authenticate } from '../middlewares/authenticate.js';

export const transactionRouter = express.Router();

transactionRouter.get('/', authenticate, ctrlTask(getAllTransactions));
transactionRouter.post('/', authenticate, ctrlTask(createTransaction));
transactionRouter.delete('/:transactionId', authenticate, validateId, ctrlTask(deleteTransaction));
transactionRouter.patch('/:transactionId', authenticate, ctrlTask(updateTransaction));
transactionRouter.get('/categories/totals', authenticate, ctrlTask(getAllCategories));
transactionRouter.get('/:month/:year', authenticate, ctrlTask(filterTransactions));
