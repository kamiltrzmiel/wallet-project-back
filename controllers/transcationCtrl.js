import mongoose from 'mongoose';
import { Transactions } from '../models/transaction';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { categoriesList } from '../utils/categoriesList';

export const getAllTransactions = async (req, res) => {
  try {
    const response = await Transactions.find({ user: req.user._id });
    res.status(200).json({ message: 'All transactions list' }, response);
  } catch (error) {
    res.status(err.statusCode || 500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const createTranasaction = async (req, res) => {
  try {
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
    const transaction = await Transactions.create({
      user: req.user._id,
      amount,
      category: selectedCategory,
      date: formattedDate,
      isIncome,
      comment,
    });

    return res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    return res.status(statusCode).json({ error: message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ID  format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format', id });
    }

    // check transaction exists
    const transaction = await Transactions.findById(id);
    if (!transaction) {
      return res
        .status(404)
        .json({ error: 'Transaction not found or already deleted', transaction });
    }

    // Verify user owns transaction
    if (transaction.user && transaction.user.toString() !== req.user._id.toString()) {
      console.log('Not authorized'); // Log to see if this block is executed
      return res.status(401).json({ error: 'Not authorized' });
    }

    // delete  transaction
    await Transactions.deleteOne({ _id: id });

    return res.json({ message: 'Transaction removed' });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const filterTransactions = async (req, res) => {
  const { month, year } = req.params;

  try {
    if (!month || !year) {
      return res.status(400).json({ error: 'Please provide both month and year' });
    }

    // check if req.user._id is a valid ObjectId
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID:', userId);
      return res.status(400).json({ error: 'Invalid user ID', userId });
    }

    // aggregate method to filter transactions
    const transactions = await Transactions.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId), // Convert user ID to ObjectId
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
    ]);

    res.json(transactions);
  } catch (error) {
    console.error('Error in filterTransactions:', error);
    res.status(500).json({ error: 'Something went wrong', error });
  }
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format', id });
    }

    let transaction = await Transactions.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', id });
    }

    if (!transaction.user.equals(req.user._id)) {
      return res.status(401).json({ error: 'Not authorized', id });
    }

    if (req.body.date) {
      req.body.date = formatDateToDDMMYYYY(req.body.date);
      if (req.body.date === 'Invalid date') {
        return res.status(400).json({ error: 'Invalid date format', id });
      }
    }

    if (req.body.category && !categoriesList.includes(req.body.category)) {
      return res.status(400).json({
        error: 'Invalid category provided. Please choose a valid category.',
        id,
      });
    }

    transaction = await Transactions.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );

    // Return the updated transaction as JSON response
    return res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    return res.status(500).json({ error: 'Server Error', additionalInfo: error.message });
  }
};

export const getCategoryTotals = async (req, res) => {
  try {
    //  total income
    const aggregateResults = await Transactions.aggregate([
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
    ]);

    const totalIncome = aggregateResults.length ? aggregateResults[0].totalIncome : 0;
    console.log('Total Income:', totalIncome);

    //  total expenses
    const totalExpensesResult = await Transactions.aggregate([
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
    ]);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;
    console.log('Total Expenses:', totalExpenses);

    //  difference
    const difference = totalIncome - totalExpenses;
    console.log('Difference:', difference);

    const results = await Transactions.aggregate([
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
    ]);

    //an array of categories based on the results
    const foundCategories = results.map(result => result.category);
    console.log('Found Categories:', foundCategories);

    // fix response array
    const totals = categories.map(category => {
      const categoryTotal = results.find(c => c.category === category.name)?.total;
      console.log(`Category: ${category.name}, Total: ${categoryTotal || 0}`);

      return {
        category: category.name,
        sum: Math.abs(categoryTotal || 0),
        color: category.color,
      };
    });

    const response = {
      totalIncome: Math.abs(totalIncome),
      totalExpenses: Math.abs(totalExpenses),
      difference,
      totals,
    };

    console.log('Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in getCategoryTotals:', error);
    res.status(500).json({ error: errorMessage });
  }
};
export const getFilteredCategoryTotals = async (req, res) => {
  const { month, year } = req.params;

  if (!month || !year) {
    return res.status(400).json({ error: 'Please provide month and year' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const aggregateResults = await Transactions.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: 'Income',
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

    const totalIncome = aggregateResults.length ? aggregateResults[0].totalIncome : 0;

    const totalExpensesResult = await Transactions.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: { $ne: 'Income' },
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

    const difference = totalIncome - totalExpenses;

    const results = await Transactions.aggregate([
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

    //  response array
    const totals = categories.map(category => {
      const categoryTotal = results.find(c => c.category === category.name)?.total;

      return {
        category: category.name,
        sum: Math.abs(categoryTotal || 0),
        color: category.color,
      };
    });

    const response = {
      totalIncome: Math.abs(totalIncome),
      totalExpenses: Math.abs(totalExpenses),
      difference,
      totals,
    };

    console.log(response);
    res.json(response);
  } catch (error) {
    console.error('Error in getFilteredCategoryTotals:', error);
    res.status(500).json({ error: errorMessage });
  }
};
