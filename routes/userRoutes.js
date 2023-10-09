import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile } from '../controllers/userCtrl';
import auth from '../middlewares/authMiddleware';

export const userRouter = express.Router();

// Trasa do rejestracji użytkownika
userRouter.post('/register', registerUser);

// Trasa do logowania użytkownika
userRouter.post('/login', loginUser);

// Trasa do wylogowania użytkownika
userRouter.get('/logout', auth, logoutUser);

// Trasa do pobierania profilu użytkownika
userRouter.get('/profile', auth, getUserProfile);
