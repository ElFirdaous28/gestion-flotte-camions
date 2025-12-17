import express from 'express';
import request from 'supertest';
import errorHandler from '../middlewares/error.middleware.js';

describe('Error Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();

        // Route to throw generic error
        app.get('/generic-error', (req, res) => {
            throw new Error('Generic error');
        });

        // Route to throw ValidationError
        app.get('/validation-error', (req, res, next) => {
            const err = new Error('Validation failed');
            err.name = 'ValidationError';
            err.errors = ['field1 is required', 'field2 is required'];
            next(err);
        });

        // Route to throw CastError
        app.get('/cast-error', (req, res, next) => {
            const err = new Error('Cast failed');
            err.name = 'CastError';
            next(err);
        });

        // Route to throw duplicate key error
        app.get('/duplicate-error', (req, res, next) => {
            const err = new Error('Duplicate key');
            err.code = 11000;
            err.keyValue = { email: 'test@example.com' };
            next(err);
        });

        // Route to throw JWT error
        app.get('/jwt-error', (req, res, next) => {
            const err = new Error('JWT failed');
            err.name = 'JsonWebTokenError';
            next(err);
        });

        // Route to throw JWT expired error
        app.get('/jwt-expired', (req, res, next) => {
            const err = new Error('JWT expired');
            err.name = 'TokenExpiredError';
            next(err);
        });

        // Use the error middleware
        app.use(errorHandler);
    });

    it('handles generic error', async () => {
        const res = await request(app).get('/generic-error');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message', 'Generic error');
    });

    it('handles Yup validation error', async () => {
        const res = await request(app).get('/validation-error');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('field1 is required, field2 is required');
    });

    it('handles CastError', async () => {
        const res = await request(app).get('/cast-error');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid ID format');
    });

    it('handles duplicate key error', async () => {
        const res = await request(app).get('/duplicate-error');
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.email).toBe('email already exists');
    });

    it('handles JWT errors', async () => {
        const res1 = await request(app).get('/jwt-error');
        expect(res1.statusCode).toBe(401);
        expect(res1.body.message).toBe('Invalid token');

        const res2 = await request(app).get('/jwt-expired');
        expect(res2.statusCode).toBe(401);
        expect(res2.body.message).toBe('Token expired');
    });
});
