import { isValidObjectId } from 'mongoose';
import { errorRequest } from '../assets/errorMessages.js';
export const validateId = (req, res, next) => {
  const { contactId } = req.params;
  const result = isValidObjectId(contactId);
  if (!result) {
    next(errorRequest(400, 'Invalid id format'));
  }
  next();
};
