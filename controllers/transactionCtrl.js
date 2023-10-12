import { Transaction } from '../models/transactions.js';
import { errorRequest } from '../assets/errorMessages.js';
import { categoriesBalance } from '../utils/categoriesBalance.js';
import { categoriesList } from '../utils/categoriesList.js';
import { formatDateToDDMMYYYY } from '../utils/dateUtils.js';
import mongoose from 'mongoose';

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
    const response = await Transaction.findByIdAndRemove(transactionId);

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
  try {
    const totalIncomeQuery = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: 'Income',
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
        },
      },
    ];
    const totalIncomeResult = await Transaction.aggregate(totalIncomeQuery);

    const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].totalIncome : 0;

    const totalExpensesQuery = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: { $ne: 'Income' },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpenses: 1,
        },
      },
    ];

    const totalExpensesResult = await Transaction.aggregate(totalExpensesQuery);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;

    const balance = totalIncome - totalExpenses;

    const expensesByCategoriesQuery = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
        },
      },
    ];

    const results = await Transaction.aggregate(expensesByCategoriesQuery);

    const totalExpensesByCategories = categoriesList.map(categoryItem => {
      const categoryTotal = results.find(aggr => aggr.category === categoryItem.name)?.total;

      return {
        category: categoryItem.name,
        amount: Math.abs(categoryTotal || 0),
      };
    });

    const summary = {
      totalIncome: Math.abs(totalIncome),
      totalExpenses: Math.abs(totalExpenses),
      balance,
      totalExpensesByCategories,
    };

    res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Your Financial Summary',
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};