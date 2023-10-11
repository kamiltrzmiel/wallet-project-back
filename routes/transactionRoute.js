import express from 'express';
import { auth } from '../middlewares/authMiddleware.js';
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  filterTransactions,
  getAllCategories,
  getFilteredCategoryTotals,
} from '../controllers/transcationCtrl.js';

export const transRouter = express.Router();

// Trasa do pobrania wszystkich transakcji
transRouter.get('/', auth, getAllTransactions);

// Trasa do tworzenia nowej transakcji
transRouter.post('/', auth, createTransaction);

// Trasa do usuwania transakcji
transRouter.delete('/:id', auth, deleteTransaction);

// Trasa do filtrowania transakcji
transRouter.get('/:month/:year', auth, filterTransactions);

// Trasa do aktualizacji transakcji
transRouter.patch('/:id', auth, updateTransaction);

// Trasa do pobrania sumy kategorii
transRouter.get('/categories/totals', auth, getAllCategories);

// Trasa do pobrania sumy kategorii z filtrem
transRouter.get('/categories/:month/:year', auth, getFilteredCategoryTotals);
