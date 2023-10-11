import { Schema, model } from 'mongoose';
import { categoriesList } from '../utils/categoriesList.js';

const transaction = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, //defincja dla MongoDB - indentyfikacja dokumentu kolekcji porzez ObjectId
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: categoriesList, // enum użwane jest do określania możliwych wartości - przekazana jest lista kategorii kosztów
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
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Transaction = model('transaction', transaction);
