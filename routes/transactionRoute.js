import express from 'express';
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  filterTransactions,
  updateTransaction,
  getCategoryTotals,
  getFilteredCategoryTotals,
} from '../controllers/transcationCtrl';

import auth from '../middlewares/authMiddleware';

export const transRouter = express.Router();

// Trasa do pobrania wszystkich transakcji
transRouter.get('/', auth, getAllTransactions);

// Trasa do tworzenia nowej transakcji
transRouter.post('/', auth, createTransaction);

// Trasa do usuwania transakcji
transRouter.delete('/:id', auth, deleteTransaction);

// Trasa do filtrowania transakcji
transRouter.get('/filter/:month/:year', auth, filterTransactions);

// Trasa do aktualizacji transakcji
transRouter.put('/:id', auth, updateTransaction);

// Trasa do pobrania sumy kategorii
transRouter.get('/totals', auth, getCategoryTotals);

// Trasa do pobrania sumy kategorii z filtrem
transRouter.get('/totals/:month/:year', auth, getFilteredCategoryTotals);