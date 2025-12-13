import express from 'express';
import {
    login,
    logout,
    refreshToken,
} from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { loginSchema } from '../validation/user.schema.js'
import isAuthenticated from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;