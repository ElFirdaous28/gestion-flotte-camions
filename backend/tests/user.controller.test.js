import request from 'supertest';
import app from './testApp.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import jwt from 'jsonwebtoken';

import { jest } from '@jest/globals';

jest.mock('../utils/email.js', () => ({
    sendTemplateEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/multer.js', () => ({
    uploadAvatar: {
        single: () => (req, res, next) => next(),
    },
}));


describe('User Controller', () => {
    let adminToken;
    let userToken;
    let adminUserId;
    let regularUserId;

    beforeEach(async () => {
        // 1. Create an Admin User
        const adminUser = await User.create({
            fullname: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });
        adminUserId = adminUser._id;
        adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });

        // 2. Create a Regular User
        const regularUser = await User.create({
            fullname: 'Regular User',
            email: 'user@example.com',
            password: 'password123',
            role: 'driver',
        });
        regularUserId = regularUser._id;
        userToken = jwt.sign({ id: regularUser._id, role: 'driver' }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    });

    describe('POST /api/users (Create User)', () => {
        it('should create a new user successfully (Admin only)', async () => {
            jest.setTimeout(15000); // 15 seconds

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    fullname: 'New Driver',
                    email: 'newdriver@example.com',
                    role: 'driver'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user).toHaveProperty('email', 'newdriver@example.com');

            // Verify in DB
            const dbUser = await User.findOne({ email: 'newdriver@example.com' });
            expect(dbUser).toBeDefined();
        });

        it('should return 400 if email already exists', async () => {
            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    fullname: 'Duplicate User',
                    email: 'user@example.com', // Already exists
                    role: 'driver'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors.email).toBe('Email already in use');
        });
    });

    describe('GET /api/users/profile', () => {
        it('should return the logged-in user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.user.email).toBe('user@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });
    });

    describe('GET /api/users (List Users)', () => {
        it('should return a paginated list of users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.users)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            // We created 2 users in beforeEach
            expect(res.body.users.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter users by search query', async () => {
            const res = await request(app)
                .get('/api/users?search=Admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.users.length).toBe(1);
            expect(res.body.users[0].fullname).toBe('Admin User');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a specific user by ID', async () => {
            const res = await request(app)
                .get(`/api/users/${regularUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.user._id).toBe(regularUserId.toString());
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = new User()._id; // Generate valid random ObjectId
            const res = await request(app)
                .get(`/api/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/users/:id (Update User)', () => {
        it('should update user details', async () => {
            const res = await request(app)
                .put(`/api/users/${regularUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ fullname: 'Updated Name' });
            if (res.statusCode !== 200) {
                console.log('Response:', res.body);
            }

            expect(res.statusCode).toBe(200);
            expect(res.body.user.fullname).toBe('Updated Name');
        });

        it('should prevent updating email to one that already exists', async () => {
            const res = await request(app)
                .put(`/api/users/${regularUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ email: 'admin@example.com' }); // Trying to take admin's email

            expect(res.statusCode).toBe(400);
            expect(res.body.errors.email).toBe('Email already in use');
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete a user and their refresh tokens', async () => {
            // Create a refresh token for this user first
            await RefreshToken.create({ user: regularUserId, token: 'some_token', expiresAt: new Date() });

            const res = await request(app)
                .delete(`/api/users/${regularUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            // Verify user is gone
            const deletedUser = await User.findById(regularUserId);
            expect(deletedUser).toBeNull();

            // Verify tokens are gone
            const tokens = await RefreshToken.find({ user: regularUserId });
            expect(tokens.length).toBe(0);
        });
    });

    describe('PUT /api/users/change-password', () => {
        it('should change password with valid current password', async () => {
            const res = await request(app)
                .patch(`/api/users/change-password/${adminUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newPassword456'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Password changed successfully');
        });

        it('should reject if current password is wrong', async () => {
            const res = await request(app)
                .patch(`/api/users/change-password/${adminUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    currentPassword: 'wrongPassword',
                    newPassword: 'newPassword456'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Current password is incorrect');
        });
    });
});