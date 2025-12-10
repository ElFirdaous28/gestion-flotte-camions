import express from 'express';

import validate from '../middlewares/validate.middleware.js';
import { changePasswordSchema, createUserSchema, updateUserSchema } from '../validation/user.schema.js'
import isAuthenticated from '../middlewares/auth.middleware.js';
import { changePassword, createUser, deleteUser, getUserById, getUsers, profile, updateUser } from '../controllers/user.controller.js';
import authorizedRoles from '../middlewares/authorize.middleware.js'
import ownerOrAdmin from '../middlewares/ownerOrAdmin.middleware.js'
import User from '../models/User.js';
import { uploadAvatar } from '../utils/multer.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/profile', profile);
router.post('/', authorizedRoles('admin'), validate(createUserSchema), createUser)
router.get('/', authorizedRoles('admin'), getUsers);
router.get('/:id', authorizedRoles('admin'), getUserById);
router.delete('/:id', ownerOrAdmin(User), deleteUser);
router.patch('/:id', ownerOrAdmin(User), validate(updateUserSchema), uploadAvatar.single('avatar'), updateUser);
router.patch('/change-password/:id', isAuthenticated, validate(changePasswordSchema), changePassword);

export default router;
