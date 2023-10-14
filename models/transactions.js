import { Schema, model } from 'mongoose';
import Joi from 'joi';
import { handleDbErrors } from '../assets/handleDbErrors.js';

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    isIncome: {
      type: Boolean,
      required: true,
      default: false,
    },
    comment: {
      type: String,
      required: false,
    },
  },
  { versionKey: false, timestamps: true }
);

transactionSchema.post('save', handleDbErrors);

const addSchema = Joi.object({
  amount: Joi.number().required(),
  category: Joi.string().required(),
  date: Joi.string().required(),
  isIncome: Joi.boolean().required(),
  comment: Joi.string(),
});

export const Transaction = model('transaction', transactionSchema);

export const schemas = {
  addSchema,
};

const filterSchema = Joi.object({
  user: Joi.string().required(),
  amount: Joi.number().required(),
  category: Joi.string().required(),
  date: Joi.string()
    .pattern(/^(\d{2}-\d{2}-\d{4})$/)
    .required(),
  isIncome: Joi.boolean().required(),
  comment: Joi.string().required(),
});
