import mongoose from 'mongoose';
import { Transactions } from '../models/transaction';

export const getAllTransactions = async (req, res) => {
  try {
    const response = await Transactions.find({ user: req.user._id });
    res.status(200).json({ message: 'All transactions list' }, response);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const createTranasctions = async (req, res) => {};

export const deleteTransaction = async (req, res) => {};

export const filterTransactions = async (req, res) => {};

export const updateTransactions = async (req, res) => {};

export const getCategoryTotals = async (req, res) => {};

export const getFilterCategoryTotals = async (req, res) => {};
