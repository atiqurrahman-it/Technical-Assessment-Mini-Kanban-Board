import express from 'express';
import authenticate from '../../../middlewares/authenticate';
import { validateRequest } from '../../../middlewares/validationRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// Register
router.post('/register', validateRequest(UserValidation.registerSchema), UserController.register);

// Login
router.post('/login', validateRequest(UserValidation.loginSchema), UserController.login);

// Current authenticated user
router.get('/me', authenticate, UserController.getMe);

export const UserRouter = router;
