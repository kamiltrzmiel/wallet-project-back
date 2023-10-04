import { Schema, model } from 'mongoose';

const usedTokensSchema = new Schema({
  token: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.JWT_EXPIRES_IN,
    // token jest automatycznie usuwany z bazy danych po określonym czasie
  },
});

export const Tokens = model('Tokens', usedTokensSchema);
