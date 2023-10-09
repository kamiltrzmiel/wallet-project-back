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
import { auth } from '../middlewares/authMiddleware';
const router = express.Router();

// Trasa do pobrania wszystkich transakcji
router.get('/', auth, getAllTransactions);

// Trasa do tworzenia nowej transakcji
router.post('/', auth, createTransaction);

// Trasa do usuwania transakcji
router.delete('/:id', auth, deleteTransaction);

// Trasa do filtrowania transakcji
router.get('/:month/:year', auth, filterTransactions);

// Trasa do aktualizacji transakcji
router.patch('/:id', auth, updateTransaction);

// Trasa do pobrania sumy kategorii
router.get('/categories/totals', auth, getCategoryTotals);

// Trasa do pobrania sumy kategorii z filtrem
router.get('/categories/:month/:year', auth, getFilteredCategoryTotals);
