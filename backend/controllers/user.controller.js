import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { sendTemplateEmail } from '../utils/email.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Generate a random password
const generatePassword = () => {
    return crypto.randomBytes(4).toString('hex'); // 8 characters
};

// Admin creates a user
export const createUser = async (req, res, next) => {
    try {
        const { fullname, email, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                errors: { email: 'Email already in use' }
            });
        }

        // Generate random password
        const password = generatePassword();

        // Create user
        const user = await User.create({ fullname, email, role, password });

        // Send email with password
        await sendTemplateEmail({
            to: email,
            subject: 'Welcome to Fleet Management',
            templatePath: './templates/welcome.hbs',
            context: { fullname, email, password }
        });

        res.status(201).json({
            message: 'User created successfully. Password sent by email.',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

// get loged in user profile
export const profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            message: 'Profile fetched successfully',
            user
        });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Filters
        const filter = {};
        if (role) filter.role = role;

        if (search) {
            filter.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ [sort]: order === 'asc' ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            User.countDocuments(filter)
        ]);

        res.json({
            message: 'Users fetched successfully',
            users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            message: 'User fetched successfully',
            user
        });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await RefreshToken.deleteMany({ user: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // If email is being changed -> check uniqueness
        if (updates.email) {
            const existing = await User.findOne({
                email: updates.email,
                _id: { $ne: id },
            });
            if (existing) {
                return res.status(400).json({
                    errors: { email: 'Email already in use' }
                });
            }
        }

        // Avatar upload
        if (req.file) {
            updates.avatar = `/uploads/avatars/${req.file.filename}`;

            const user = await User.findById(id);
            if (user?.avatar) {
                fs.unlink(path.join(process.cwd(), user.avatar), () => { });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser)
            return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        next(err);
    }
};


export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};