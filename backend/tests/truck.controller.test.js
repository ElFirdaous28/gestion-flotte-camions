import request from 'supertest';
import app from './testApp.js'; // Ensure this points to your Express app
import Truck from '../models/Truck.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Truck Controller', () => {
    let adminToken;
    let driverToken;
    let truckId;

    // Data for a standard truck
    const truckData = {
        plateNumber: 'AA-123-BB',
        brand: 'Volvo',
        model: 'FH16',
        purchaseDate: new Date('2023-01-01'),
        towingCapacity: 20000,
        status: 'available',
    };

    beforeEach(async () => {
        // create Admin usre
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@trucks.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // create Driver user
        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@trucks.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });

        //  Create a Truck for tests
        const truck = await Truck.create(truckData);
        truckId = truck._id;
    });

    describe('POST /api/trucks', () => {
        it('should create a new truck successfully (Admin)', async () => {
            const newTruck = {
                plateNumber: 'ZZ-999-ZZ',
                brand: 'Mercedes',
                model: 'Actros',
                purchaseDate: '2024-01-01',
                towingCapacity: 25000
            };

            const res = await request(app)
                .post('/api/trucks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newTruck);

            expect(res.statusCode).toBe(201);
            expect(res.body.plateNumber).toBe(newTruck.plateNumber);
            expect(res.body.status).toBe('available'); // default check
        });

        it('should return 403 Forbidden for Non-Admin users', async () => {
            const newTruck = {
                plateNumber: 'XX-000-XX',
                brand: 'Scania',
                model: 'R500',
                purchaseDate: '2024-01-01',
                towingCapacity: 22000
            };

            const res = await request(app)
                .post('/api/trucks')
                .set('Authorization', `Bearer ${driverToken}`) // Driver Token
                .send(newTruck);

            expect([403]).toContain(res.statusCode);
        });

        it('should return 400 if plateNumber already exists', async () => {
            const duplicateTruck = { ...truckData }; 

            const res = await request(app)
                .post('/api/trucks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(duplicateTruck);

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/trucks', () => {
        it('should return a paginated list of trucks', async () => {
            const res = await request(app)
                .get('/api/trucks')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.trucks)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.trucks.length).toBeGreaterThanOrEqual(1);
        });

        it('should filter trucks by status', async () => {
            // Create a specialized truck
            await Truck.create({
                plateNumber: 'MN-555-OP',
                brand: 'MAN',
                model: 'TGX',
                purchaseDate: new Date(),
                towingCapacity: 18000,
                status: 'maintenance'
            });

            const res = await request(app)
                .get('/api/trucks?status=maintenance')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trucks.length).toBe(1);
            expect(res.body.trucks[0].status).toBe('maintenance');
        });

        it('should search trucks by brand or plate number', async () => {
            const res = await request(app)
                .get('/api/trucks?search=Volvo') // matches "Volvo" from beforeEach
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trucks.length).toBeGreaterThanOrEqual(1);
            expect(res.body.trucks[0].brand).toBe('Volvo');
        });
    });

    describe('GET /api/trucks/:id', () => {
        it('should return a truck by ID', async () => {
            const res = await request(app)
                .get(`/api/trucks/${truckId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.plateNumber).toBe(truckData.plateNumber);
        });

        it('should return 404 for non-existent ID', async () => {
            const fakeId = new User()._id; // Generate a valid but non-existent ObjectId
            const res = await request(app)
                .get(`/api/trucks/${fakeId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/trucks/:id', () => {
        it('should update truck details successfully (Admin)', async () => {
            const res = await request(app)
                .put(`/api/trucks/${truckId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ km: 5000, status: 'on_trip' });

            expect(res.statusCode).toBe(200);
            expect(res.body.km).toBe(5000);
            expect(res.body.status).toBe('on_trip');
        });

        it('should fail update for Non-Admin', async () => {
            const res = await request(app)
                .put(`/api/trucks/${truckId}`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ km: 9999 });

            expect([401, 403]).toContain(res.statusCode);
        });
    });

    describe('DELETE /api/trucks/:id', () => {
        it('should delete a truck successfully (Admin)', async () => {
            const res = await request(app)
                .delete(`/api/trucks/${truckId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            // Verify deletion
            const check = await Truck.findById(truckId);
            expect(check).toBeNull();
        });

        it('should fail delete for Non-Admin', async () => {
            const res = await request(app)
                .delete(`/api/trucks/${truckId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect([401, 403]).toContain(res.statusCode);
        });
    });
});