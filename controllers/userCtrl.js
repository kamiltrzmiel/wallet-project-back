import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

//rejstr uzytkownika
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    const payload = {
      id: user.id,
      username: email,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.status(201).json({ message: registrationSuccess, user: { name, email, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    //sprawdzenie nazwy użytkownika
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const name = user.name;
    //porównanie hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Inavlid password' });
    }

    const payload = {
      id: user.id,
      username: user.email,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      token: token,
      // refreshToken: newRefreshToken,

      user: { name, email, token },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, token } = user;

    res.status(200).json({ name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Get user profile failed' });
  }
};

export const refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: `Refresh token is required << ''refreshToken'' : ''string'' >>` });
    }

    const user = await User.findOne({ token: refreshToken });

    if (!user) {
      return res.status(401).json({ error: 'Refresh token is not valid' });
    }

    const payload = {
      id: user.id,
      username: user.email,
    };

    const newAccessToken = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

    user.token = newAccessToken;
    await user.save();

    res.status(200).json({ message: 'Token refreshed successfully', token: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.token = null;
    // user.refreshToken = null;
    await user.save();
    const { name } = user;

    res.status(200).json({ message: `Logout ${name} successful` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed' });
  }
};
