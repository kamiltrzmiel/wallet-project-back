import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Tokens } from '../models/usedTokens';
import { TokenExpiredError } from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    //sprawdza czy jest header
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const getToken = authorizationHeader.split(' ')[1];

    const decoded = jwt.verify(getToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', user });
    }

    const usedToken = await Tokens.exists({ token: getToken });

    if (usedToken) {
      return res.status(401).json({ error: 'Access token is in use', usedToken });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Access token expired' });
    } else {
      return res.status(401).json({ error: 'Invalid access token' });
    }
  }
};
