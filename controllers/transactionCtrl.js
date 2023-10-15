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
    console.log({ ...req.body, user });
    const newTransaction = await Transaction.create({ ...req.body, user });
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error' });
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
    const response = await Transaction.findById(transactionId);

    if (!response) {
      throw errorRequest(404, 'Not found');
    }
    if (!response.user.equals(user)) {
      throw errorRequest(403, 'Access denied');
    }

    Object.assign(response, req.body);
    await response.save();

    res.status(200).json({
      message: 'Transaction updated',
      response,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const filterTransactions = async (req, res) => {
  const { month, year } = req.params;
  console.log('Month:', month, 'Year:', year);

  if (!month || !year) {
    console.log('Month or year missing');
    return res.status(400).json({ error: 'Please enter /month(MM) and /year(YYYY)' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  const matchStage = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $year: {
                    $dateFromString: { dateString: '$date', format: '%d-%m-%Y' },
                  },
                },
                parseInt(year),
              ],
            },
            {
              $eq: [
                {
                  $month: {
                    $dateFromString: { dateString: '$date', format: '%d-%m-%Y' },
                  },
                },
                parseInt(month),
              ],
            },
          ],
        },
      },
    },
  ];

  try {
    const transactions = await Transaction.aggregate(matchStage);
    console.log('Transactions:', transactions);
    res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'List of User transactions from the selected period (MM/YYYY)',
      transactions,
    });
  } catch (error) {
    console.error('Error in filterTransactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const totalIncomeQuery = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          isIncome: true,
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
          isIncome: false,
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

    const totalExpensesByCategories = categoriesBalance.map(categoryItem => {
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
