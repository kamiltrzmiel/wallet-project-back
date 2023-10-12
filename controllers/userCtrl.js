import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { errorRequest } from '../assets/errorMessages.js';
const secKey = process.env.SECRET_KEY;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw errorRequest(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await User.create({ name, email, password: hashPassword });

    res.status(201).json({
      name: result.name,
      email: result.email,
      subscription: result.subscription,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw errorRequest(401, 'Email or password is wrong');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw errorRequest(401, 'Email or password is wrong');
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, secKey, { expiresIn: '12h' });
    await User.findByIdAndUpdate(user._id, { token });
    res.status(200).json({
      message: 'Login success',
      token,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const getCurrent = async (req, res) => {
  try {
    const { name, email, subscription } = req.user;
    res.status(200).json({
      name,
      email,
      subscription,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: '' });
    res.status(200).json({
      message: 'Logout success',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { email } = req.user;
    const { subscription } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw errorRequest(401, 'Email or password is wrong');
    }

    const result = await User.findByIdAndUpdate(user._id, { subscription });
    res.status(200).json({
      name: user.name,
      email: user.email,
      subscription,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
};
