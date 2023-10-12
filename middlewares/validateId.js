import { isValidObjectId } from 'mongoose';
import { errorRequest } from '../assets/errorMessages.js';
export const validateId = (req, res, next) => {
  const { transactionId } = req.params;
  const result = isValidObjectId(transactionId);
  if (!result) {
    next(errorRequest(400, 'Invalid id format'));
  }
  next();
};
