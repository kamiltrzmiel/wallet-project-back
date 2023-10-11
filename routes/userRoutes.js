import express from 'express';
import { auth } from '../middlewares/authMiddleware.js';
import { validateLogin, validateRegister } from '../middlewares/validMiddleware.js';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getUserProfile,
} from '../controllers/userCtrl.js';

export const userRouter = express.Router();

// Trasa do rejestracji użytkownika
userRouter.post('/register', validateRegister, registerUser);

// Trasa do logowania użytkownika
userRouter.post('/login', loginUser); //without validateLogin

// Trasa do refresh tokena
userRouter.post('/refresh', refreshTokens);

// Trasa do wylogowania użytkownika
userRouter.get('/logout', auth, logoutUser);

// Trasa do pobierania profilu użytkownika
userRouter.get('/profile', auth, getUserProfile);
