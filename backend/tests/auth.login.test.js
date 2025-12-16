import request from 'supertest';
import app from './testApp.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';

describe('Auth Controller - Login', () => {

    it('should login successfully with valid credentials', async () => {
        await User.create({
            fullname: 'Test User',
            email: 'test@example.com',
            password: '123456',
            role: 'driver',
        });

        // Attempt login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: '123456',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'notfound@example.com',
                password: '123456',
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it('should return 400 if password is invalid', async () => {
        await User.create({
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'correctpass',
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpass',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });
});

describe('Auth Controller - Refresh Token', () => {
    let user;
    let validRefreshToken;

    beforeEach(async () => {
        // Create a user before each test
        user = await User.create({
            fullname: 'Refresh User',
            email: 'refresh@example.com',
            password: 'password123',
            role: 'driver',
        });

        // Generate a valid JWT for this user
        validRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Save it to DB
        await RefreshToken.create({
            user: user._id,
            token: validRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    });

    it('should return new access token and set new cookie)', async () => {
        console.log('Initial token:', validRefreshToken);

        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [`refresh_token=${validRefreshToken}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');

        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/refresh_token=/);

        // Debug: check all tokens
        const allTokens = await RefreshToken.find({ user: user._id });
        console.log('All tokens for user:', allTokens);
        console.log('Looking for token:', validRefreshToken);

        const oldTokenInDb = await RefreshToken.findOne({ token: validRefreshToken });
        console.log('Found old token:', oldTokenInDb);
        expect(oldTokenInDb).toBeNull();

        const count = await RefreshToken.countDocuments({ user: user._id });
        expect(count).toBe(1);
    });
    it('should return 401 if refresh token is missing', async () => {
        const res = await request(app).post('/api/auth/refresh');
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('No refresh token found');
    });

    it('should return 401 if token is valid but NOT in database (Revoked/Reuse Attack)', async () => {
        await RefreshToken.deleteOne({ token: validRefreshToken });

        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [`refresh_token=${validRefreshToken}`]);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Refresh token revoked');
    });
});