import express from 'express';
import { register, login, logout, profile } from '../controllers/userCtrl.js';
import { ctrlTask } from '../assets/ctrlTask.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { schemas } from '../models/user.js';

export const usersRouter = express.Router();

usersRouter.post('/register', validateBody(schemas.registerSchema), ctrlTask(register));
usersRouter.post('/login', validateBody(schemas.loginSchema), ctrlTask(login));
usersRouter.get('/profile', authenticate, ctrlTask(profile));
usersRouter.get('/logout', authenticate, ctrlTask(logout));
