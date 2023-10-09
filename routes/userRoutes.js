import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile } from '../controllers/userCtrl';
import auth from '../middlewares/authMiddleware';
const router = express.Router();

// Trasa do rejestracji użytkownika
router.post('/register', auth, registerUser);

// Trasa do logowania użytkownika
router.post('/login', auth, loginUser);

// Trasa do wylogowania użytkownika
router.get('/logout', auth, logoutUser);

// Trasa do pobierania profilu użytkownika
router.get('/profile', auth, getUserProfile);
