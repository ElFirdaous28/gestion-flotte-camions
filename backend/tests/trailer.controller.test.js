import request from 'supertest';
import app from './testApp.js';
import Trailer from '../models/Trailer.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Trailer Controller', () => {
    let adminToken;
    let driverToken;
    let trailerId;

    // Standard trailer data for setup
    const trailerData = {
        plateNumber: 'TL-100-AB',
        type: 'flatbed',
        maxLoad: 30000,
        purchaseDate: new Date('2023-06-01'),
        status: 'available',
    };

    beforeEach(async () => {
        // Create Admin
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@trailers.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Create Driver
        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@trailers.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });

        //  Create a Trailer
        const trailer = await Trailer.create(trailerData);
        trailerId = trailer._id;
    });

    describe('POST /api/trailers', () => {
        it('should create a new trailer successfully (Admin)', async () => {
            const newTrailer = {
                plateNumber: 'TL-999-XZ',
                type: 'refrigerated',
                maxLoad: 25000,
                purchaseDate: '2024-02-01'
            };

            const res = await request(app)
                .post('/api/trailers')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newTrailer);

            expect(res.statusCode).toBe(201);
            expect(res.body.plateNumber).toBe(newTrailer.plateNumber);
            expect(res.body.status).toBe('available'); // Default
        });

        it('should return 401 for Non-Admin users', async () => {
            const newTrailer = {
                plateNumber: 'TL-000-NO',
                type: 'box',
                maxLoad: 10000,
                purchaseDate: '2024-01-01'
            };

            const res = await request(app)
                .post('/api/trailers')
                .set('Authorization', `Bearer ${driverToken}`)
                .send(newTrailer);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/trailers', () => {
        it('should return a paginated list of trailers', async () => {
            const res = await request(app)
                .get('/api/trailers')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trailers.length).toBeGreaterThanOrEqual(1);
            expect(res.body.pagination).toBeDefined();
        });

        it('should filter trailers by type', async () => {
            // Create a specific type trailer
            await Trailer.create({
                plateNumber: 'TL-555-BX',
                type: 'box',
                maxLoad: 5000,
                purchaseDate: new Date()
            });

            const res = await request(app)
                .get('/api/trailers?type=box')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trailers.length).toBe(1);
            expect(res.body.trailers[0].type).toBe('box');
        });

        it('should search trailers by plate number', async () => {
            const res = await request(app)
                .get('/api/trailers?search=TL-100') // matches existing trailer
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trailers.length).toBe(1);
            expect(res.body.trailers[0].plateNumber).toBe('TL-100-AB');
        });
    });

    describe('GET /api/trailers/:id', () => {
        it('should return a trailer by ID', async () => {
            const res = await request(app)
                .get(`/api/trailers/${trailerId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.plateNumber).toBe(trailerData.plateNumber);
        });

        it('should return 404 for non-existent ID', async () => {
            const fakeId = new User()._id; // valid format, incorrect ID
            const res = await request(app)
                .get(`/api/trailers/${fakeId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/trailers/:id', () => {
        it('should update trailer details (Admin)', async () => {
            const res = await request(app)
                .put(`/api/trailers/${trailerId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ maxLoad: 35000 });

            expect(res.statusCode).toBe(200);
            expect(res.body.maxLoad).toBe(35000);
        });

        it('should fail update for Non-Admin', async () => {
            const res = await request(app)
                .put(`/api/trailers/${trailerId}`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ maxLoad: 35000 });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PATCH /api/trailers/:id/status', () => {
        it('should allow drivers to update trailer status', async () => {
            const res = await request(app)
                .patch(`/api/trailers/${trailerId}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'on_trip' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('on_trip');
        });

        it('should return 400 for invalid status value', async () => {
            const res = await request(app)
                .patch(`/api/trailers/${trailerId}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'flying' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/trailers/:id', () => {
        it('should delete a trailer successfully (Admin)', async () => {
            const res = await request(app)
                .delete(`/api/trailers/${trailerId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const check = await Trailer.findById(trailerId);
            expect(check).toBeNull();
        });

        it('should fail delete for Non-Admin', async () => {
            const res = await request(app)
                .delete(`/api/trailers/${trailerId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});