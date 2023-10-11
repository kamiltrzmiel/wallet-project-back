import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { Transaction } from '../models/transaction.js';
import { formatDateToDDMMYYYY } from '../utils/dateUtils.js';
import { categoriesList } from '../utils/categoriesList.js';
import { categoriesBalance } from '../utils/categoriesBalance.js';

export const getAllTransactions = async (req, res, next) => {
  try {
    const response = await Transaction.find({ user: req.user._id });
    res.status(200).json(
      {
        status: 'Success',
        code: 200,
        message: 'All transactions list',
      },
      response
    );
  } catch (error) {
    console.error(error);
    res.status(err.statusCode || 500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const createTransaction = async (req, res) => {
  const { amount, category, date, isIncome, comment } = req.body;

  // missing fields
  if (!date || isIncome === undefined)
    return res.status(400).json({ error: 'Please provide all required fields' });

  // Remove "category" if "isIncome" is true
  if (isIncome) delete req.body.category;

  // if  amount is positive
  if (amount <= 0) return res.status(400).json({ error: 'The amount must be positive' });

  // date to "DD-MM-YYYY" format
  const formattedDate = formatDateToDDMMYYYY(date);
  if (formattedDate === 'Invalid date')
    return res.status(400).json({ error: 'Invalid date format' });

  // set  category to "Income" if isIncome is true
  const selectedCategory = isIncome ? 'Income' : category;

  if (!categoriesList.includes(selectedCategory)) {
    return res.status(400).json({
      error: `Invalid category provided. Please choose a valid category from: ${categoriesList.join(
        ', '
      )}`,
    });
  }

  // create transaction
  try {
    const newTransaction = await Transaction.create({
      user: req.user._id,
      amount,
      category: selectedCategory,
      date: formattedDate,
      isIncome,
      comment,
    });
    return res.status(201).json({
      status: 'Created',
      code: 201,
      message: 'Transaction created successfully',
      newTransaction,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    return res.status(statusCode).json({ error: message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid transaction id' });
  }

  try {
    const transactionToRemove = await Transaction.findById(id);

    if (!transactionToRemove) {
      return res.status(404).json({ error: 'Transaction was not found or already deleted' });
    }

    if (
      transactionToRemove.user &&
      transactionToRemove.user.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    await Transaction.deleteOne({ _id: id });

    res.status(200).json({
      status: 'Success',
      code: 200,
      message: `Transaction with id ${id} removed successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    let result = await Transaction.findById(id);

    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!result.user.equals(req.user._id)) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    if (req.body.date) {
      req.body.date = formatDateToDDMMYYYY(req.body.date);
      if (req.body.date === 'Invalid date') {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    if (req.body.category && !categoriesList.includes(req.body.category)) {
      return res
        .status(400)
        .json({ error: 'Invalid category provided. Please enter the correct category.' });
    }

    result = await Transaction.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true });

    res.status(200).json({
      status: 'Success',
      code: 200,
      message: `Updated transaction with id ${id}`,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

export const filterTransactions = async (req, res) => {
  const { month, year } = req.params;

  if (!month || !year) {
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
                { $year: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                parseInt(year),
              ],
            },
            {
              $eq: [
                { $month: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
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
    res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'List of User transactions from the selected period (MM/YYYY)',
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const totalIncomePipeline = [
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
    const totalIncomeResult = await Transaction.aggregate(totalIncomePipeline);

    const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].totalIncome : 0;

    const totalExpensesPipeline = [
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

    const totalExpensesResult = await Transaction.aggregate(totalExpensesPipeline);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;

    const balance = totalIncome - totalExpenses;

    const expensesByCategoriesPipeline = [
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

    const results = await Transaction.aggregate(expensesByCategoriesPipeline);

    const totalExpensesByCategories = categoriesBalance.map(category => {
      const categoryTotal = results.find(aggr => aggr.category === category.name)?.total;

      return {
        category: category.name,
        amount: Math.abs(categoryTotal || 0),
      };
    });

    const outcome = {
      totalIncome: Math.abs(totalIncome),
      totalExpenses: Math.abs(totalExpenses),
      balance,
      totalExpensesByCategories,
    };

    res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Sum of User income, expenses (also by category) and balance',
      outcome,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFilteredCategoryTotals = async (req, res) => {
  const { month, year } = req.params;

  // Check if month and year are provided
  if (!month || !year) {
    return res.status(400).json({ error: 'Please provide month and year' });
  }

  // Validate req.user._id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Calculate total income
    const totalIncomeResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: 'Income',
          $expr: {
            $and: [
              // Extract year from "date" field and compare with the specified year
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(year),
                ],
              },
              // Extract month from "date" field and compare with the specified month
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(month),
                ],
              },
            ],
          },
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
    ]);

    const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].totalIncome : 0;

    // Calculate total expenses
    const totalExpensesResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: { $ne: 'Income' }, // Match all categories except 'Income'
          $expr: {
            $and: [
              // Extract year from "date" field and compare with the specified year
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(year),
                ],
              },
              // Extract month from "date" field and compare with the specified month
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(month),
                ],
              },
            ],
          },
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
    ]);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;

    // Calculate the difference between income and expenses
    const difference = totalIncome - totalExpenses;

    const results = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          $expr: {
            $and: [
              // Extract year from "date" field and compare with the specified year
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(year),
                ],
              },
              // Extract month from "date" field and compare with the specified month
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(month),
                ],
              },
            ],
          },
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
    ]);

    // fix response array
    const totals = categoriesList.map(category => {
      const categoryTotal = results.find(c => c.category === category.name)?.total;

      return {
        category: category.name,
        sum: Math.abs(categoryTotal || 0), // Make total positive or 0
        color: category.color,
      };
    });

    // Add the total income, total expenses, and difference at the start of the response
    const response = {
      totalIncome: Math.abs(totalIncome), // Make total income positive
      totalExpenses: Math.abs(totalExpenses), // Make total expenses positive
      difference,
      totals,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
