import { errorRequest } from '../assets/errorMessages.js';
export const validateBody = schema => {
  const runValidate = async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(errorRequest(200, error.message('OK')));
    }
    next();
  };
  return runValidate;
};
