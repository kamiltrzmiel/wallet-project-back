// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import { User } from '../models/user.js';
// import { errorRequest } from '../assets/errorMessages.js';
// dotenv.config();

// const secKey = process.env.SECRET_KEY;

// export const authenticate = async (req, res, next) => {
//   try {
//     const { authorization = '' } = req.headers;
//     const [bearer, token] = authorization.split(' ');
//     if (bearer !== 'Bearer' || !token) {
//       return res.status(401).json({ error: 'Not authorized' });
//     }
//     const { id } = jwt.verify(token, secKey);
//     const user = await User.findById(id);

//     if (!user || user.token !== token) {
//       return res.status(401).json({ error: 'Not authorized' });
//     }
//     req.user = user;
//     next();
//   } catch {
//     return res.status(401).json({ error: 'Not authorized' });
//   }
// };

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/db.js';

dotenv.config();

const secKey = process.env.SECRET_KEY;

export const authenticate = async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const decodedToken = jwt.verify(token, secKey);

    const userCursor = await db.query(aql`
      FOR u IN users
      FILTER u._id == ${decodedToken.id}
      RETURN u
    `);

    const user = await userCursor.next();

    if (!user || user.token !== token) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Not authorized' });
  }
};
