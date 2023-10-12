import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.js';
import { errorRequest } from '../assets/errorMessages.js';

dotenv.config();
const secKey = process.env.SECRET_KEY;

export const authenticate = async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw errorRequest(401, 'Not authorized');
    }
    const { id } = jwt.verify(token, secKey);
    const user = await User.findById(id);
    if (!user || user.token !== token) {
      throw errorRequest(401, 'Not authorized');
    }
    req.user = user;
    next();
  } catch {
    throw errorRequest(401, 'Not authorized');
  }
};
