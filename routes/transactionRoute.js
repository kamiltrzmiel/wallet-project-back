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

const router = express.Router();

// Trasa do pobrania wszystkich transakcji
router.get('/', getAllTransactions);

// Trasa do tworzenia nowej transakcji
router.post('/', createTransaction);

// Trasa do usuwania transakcji
router.delete('/:id', deleteTransaction);

// Trasa do filtrowania transakcji
router.get('/filter/:month/:year', filterTransactions);

// Trasa do aktualizacji transakcji
router.put('/:id', updateTransaction);

// Trasa do pobrania sumy kategorii
router.get('/totals', getCategoryTotals);

// Trasa do pobrania sumy kategorii z filtrem
router.get('/totals/:month/:year', getFilteredCategoryTotals);

export default router;
