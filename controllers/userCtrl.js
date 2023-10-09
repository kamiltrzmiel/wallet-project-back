import { User } from '../models/user.js';
import { Tokens } from '../models/usedTokens.js';
import jwt from 'jsonwebtoken';
// import { TokenExpiredError } from 'jsonwebtoken';
import { generateAuthTokens } from '../utils/tokenUtils.js';
import validator from 'validator';
const { TokenExpiredError } = jwt;

//rejstr uzytkownika
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  //spr formatu maila przez validator

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      email,
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email is already in use',
        existingUser,
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // generuje tokeny acces i refresh z tokenUtils
    const { getToken, refreshToken } = generateAuthTokens(user._id);

    res.status(201).json({
      getToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      existingUser,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials', user);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error('Invalid credentials', user);
    }

    // generuje tokeny acces i refresh z tokenUtils
    const { getToken, refreshToken } = generateAuthTokens(user._id);

    res.json({
      getToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        user,
      });
    }

    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    //pobiera token z headera autoryzacji - dzieli zeby zostawic bearer token
    const getToken = req.header('Authorization').split(' ')[1];

    //weryfikacja przez sekret - jesli skuteczna pobiera user ID
    const decoded = jwt.verify(getToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', user });
    }

    await Tokens.create({ token: getToken });

    res.status(200).json({ message: 'Logged out successfully', user });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      console.error(error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

export const refreshTokens = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  try {
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decodedRefreshToken.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(decodedRefreshToken.id);

    if (!user) {
      throw new Error('Invalid refresh token', user);
    }

    const isInUse = await Tokens.exists({ token: refreshToken });

    if (isInUse) {
      throw new Error('Token in use', isInUse);
    }

    const { getToken, refreshToken: newRefreshToken } = generateAuthTokens(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.json({
      getToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};
