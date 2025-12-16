import request from 'supertest';
import app from './testApp.js';
import Tire from '../models/Tire.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Tire Controller', () => {
    let adminToken;
    let driverToken;
    let truckId;
    let trailerId;
    let tireId;

    // Standard Tire Data
    const tireData = {
        brand: 'Michelin',
        model: 'X Multi',
        size: '315/80R22.5',
        position: 'front-left',
        status: 'stock',
        purchaseDate: new Date(),
        km: 0
    };

    beforeEach(async () => {
        // 1. Create Users
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@tires.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@tires.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });

        // 2. Create Dummy Truck & Trailer for associations
        const truck = await Truck.create({
            plateNumber: 'TR-TIRE-01',
            brand: 'Volvo',
            model: 'FH',
            purchaseDate: new Date(),
            towingCapacity: 20000
        });
        truckId = truck._id;

        const trailer = await Trailer.create({
            plateNumber: 'TL-TIRE-01',
            type: 'box',
            maxLoad: 30000,
            purchaseDate: new Date()
        });
        trailerId = trailer._id;

        // 3. Create a Dummy Tire
        const tire = await Tire.create(tireData);
        tireId = tire._id;
    });

    /* =========================================================================
       POST /api/tires (Create)
       ========================================================================= */
    describe('POST /api/tires', () => {
        it('should create a tire linked to a truck successfully (Admin)', async () => {
            const newTire = {
                brand: 'Bridgestone',
                model: 'R249',
                size: '295/80R22.5',
                position: 'rear-right',
                status: 'used',
                purchaseDate: '2024-01-01',
                truck: truckId // Associating with Truck
            };

            const res = await request(app)
                .post('/api/tires')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newTire);

            expect(res.statusCode).toBe(201);
            expect(res.body.brand).toBe('Bridgestone');
            expect(res.body.truck).toBe(truckId.toString());
        });

        it('should return 400 if referenced truck does not exist', async () => {
            const fakeId = new User()._id; // Valid ObjectId, but not a truck
            const res = await request(app)
                .post('/api/tires')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...tireData, truck: fakeId, status: 'mounted' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/truck does not exist/i);
        });

        it('should fail for Non-Admin users', async () => {
            const res = await request(app)
                .post('/api/tires')
                .set('Authorization', `Bearer ${driverToken}`)
                .send(tireData);

            expect(res.statusCode).toBe(403);
        });
    });

    /* =========================================================================
       GET /api/tires (List & Filter)
       ========================================================================= */
    describe('GET /api/tires', () => {
        it('should list tires successfully (Admin)', async () => {
            const res = await request(app)
                .get('/api/tires')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.tires.length).toBeGreaterThanOrEqual(1);
        });

        it('should return 400 if both truck and trailer filters are provided', async () => {
            // Your controller logic specifically forbids this combination
            const res = await request(app)
                .get(`/api/tires?truck=${truckId}&trailer=${trailerId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/cannot provide both/i);
        });

        it('should deny access to Non-Admins', async () => {
            const res = await request(app)
                .get('/api/tires')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    /* =========================================================================
       GET /api/tires/available
       ========================================================================= */
    describe('GET /api/tires/available', () => {
        it('should return tires specifically in stock/used/needs_replacement', async () => {
            // Check the tire created in beforeEach (status: 'stock')
            const res = await request(app)
                .get('/api/tires/available')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.tires.length).toBeGreaterThanOrEqual(1);
            expect(res.body.tires[0].status).toBe('stock');
        });
    });

    /* =========================================================================
       GET /api/tires/:id (Single)
       ========================================================================= */
    describe('GET /api/tires/:id', () => {
        it('should return a specific tire', async () => {
            const res = await request(app)
                .get(`/api/tires/${tireId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.brand).toBe('Michelin');
        });

        it('should return 404 for invalid ID', async () => {
            const fakeId = new User()._id;
            const res = await request(app)
                .get(`/api/tires/${fakeId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    /* =========================================================================
       PUT /api/tires/:id (Update)
       ========================================================================= */
    describe('PUT /api/tires/:id', () => {
        // According to your routes: router.put('/:id', ... updateTire) 
        // It does NOT have authorizedRoles('admin'), so Drivers can access it.
        it('should update tire details (Driver allowed per route def)', async () => {
            const res = await request(app)
                .put(`/api/tires/${tireId}`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ ...tireData, km: 50000 });

            expect(res.statusCode).toBe(200);
            expect(res.body.km).toBe(50000);
        });

        it('should fail if updating with invalid trailer ID', async () => {
            const fakeId = new User()._id;
            const res = await request(app)
                .put(`/api/tires/${tireId}`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ ...tireData, trailer: fakeId, status: 'mounted' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/trailer does not exist/i);
        });
    });

    /* =========================================================================
       PATCH /api/tires/:id/status
       ========================================================================= */
    describe('PATCH /api/tires/:id/status', () => {
        it('should update tire status', async () => {
            const res = await request(app)
                .patch(`/api/tires/${tireId}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'needs_replacement' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('needs_replacement');
        });
    });

    /* =========================================================================
       DELETE /api/tires/:id
       ========================================================================= */
    describe('DELETE /api/tires/:id', () => {
        it('should delete tire successfully (Admin)', async () => {
            const res = await request(app)
                .delete(`/api/tires/${tireId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const check = await Tire.findById(tireId);
            expect(check).toBeNull();
        });

        it('should fail delete for Non-Admin', async () => {
            const res = await request(app)
                .delete(`/api/tires/${tireId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});