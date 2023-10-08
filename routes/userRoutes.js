import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/userCtrl';
import auth from '../middlewares/authMiddleware';
const router = express.Router();

// Trasa do rejestracji użytkownika
router.post('/register', registerUser);

// Trasa do logowania użytkownika
router.post('/login', loginUser);

// Trasa do wylogowania użytkownika
router.post('/logout', logoutUser);

// Trasa do pobierania profilu użytkownika
router.get('/profile', auth, getUserProfile);

// Trasa do aktualizacji profilu użytkownika
router.put('/profile', auth, updateUserProfile);

export default router;
