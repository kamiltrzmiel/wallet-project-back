import { Transaction } from '../models/transactions.js';
import { errorRequest } from '../assets/errorMessages.js';
import { categoriesBalance } from '../utils/categoriesBalance.js';
import { categoriesList } from '../utils/categoriesList.js';
import { formatDateToDDMMYYYY } from '../utils/dateUtils.js';

export const getAllTransactions = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const response = await Transaction.find({ user });
    res.status(200).json({ message: 'All transaction list', response });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const response = await Transaction.create({ ...req.body, user });

    // ......................logic

    res.status(201).json({ message: 'Added new transaction', response });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { _id: user } = req.user;
    const response = await Contact.findByIdAndRemove(transactionId);

    if (!response.user.equals(user)) {
      throw errorRequest(403, 'Access denied');
    }
    if (!response) {
      throw errorRequest(404, 'Not found');
    }
    res.status(200).json({
      message: 'Transaction deleted',
      response,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { _id: user } = req.user;
    const response = await Transaction.findByIdAndUpdate(transactionId, req.body, { new: true });

    if (!response.owner.equals(user)) {
      throw errorRequest(403, 'Access denied');
    }
    if (!response) {
      throw errorRequest(404, 'Not found');
    }
    res.status(200).json({
      message: 'Transaction updated',
      response,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const filterTransactions = async (req, res) => {
  const { month, year } = req.parms;
  // ............................logic
};

export const getAllCategories = async (req, res) => {
  // ...........................logic
};
