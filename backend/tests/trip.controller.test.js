import request from 'supertest';
import app from './testApp.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import Tire from '../models/Tire.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Trip Controller', () => {
    let adminToken, driverToken;
    let truckId, trailerId, driverId, tripId;
    let tireId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    beforeEach(async () => {
        // create Users
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@trips.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@trips.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });
        driverId = driver._id;

        // create resources
        const truck = await Truck.create({
            plateNumber: 'TR-TRIP-01',
            brand: 'Volvo',
            model: 'FH',
            purchaseDate: new Date(),
            towingCapacity: 40000,
            km: 10000, // initial KM
            status: 'available'
        });
        truckId = truck._id;

        const trailer = await Trailer.create({
            plateNumber: 'TL-TRIP-01',
            type: 'box',
            maxLoad: 30000,
            purchaseDate: new Date(),
            status: 'available'
        });
        trailerId = trailer._id;

        // create a Tire on the Truck (to test KM updates)
        const tire = await Tire.create({
            brand: 'Michelin',
            model: 'X',
            size: '22.5',
            position: 'front-left',
            truck: truckId, // linked to truck
            km: 5000
        });
        tireId = tire._id;

        // create a "To-Do" Trip
        const trip = await Trip.create({
            truck: truckId,
            trailer: trailerId,
            driver: driverId,
            startLocation: 'Paris',
            endLocation: 'Lyon',
            startDate: startDate,
            endDate: endDate,
            status: 'to-do',
            type: 'delivery',
            kmStart: 10000 // matches truck KM
        });
        tripId = trip._id;
    });

    describe('POST /api/trips', () => {
        it('should create a new trip successfully (Admin)', async () => {
            const newTruck = await Truck.create({ plateNumber: 'TR-NEW', brand: 'X', model: 'Y', purchaseDate: new Date(), towingCapacity: 1 });
            const newTrailer = await Trailer.create({ plateNumber: 'TL-NEW', type: 'box', maxLoad: 1, purchaseDate: new Date() });

            const tripData = {
                truck: newTruck._id,
                trailer: newTrailer._id,
                driver: driverId,
                startLocation: 'Lille',
                endLocation: 'Marseille',
                startDate: new Date(startDate.getTime() + 86400000 * 10), // 10 days later
                endDate: new Date(startDate.getTime() + 86400000 * 12)
            };

            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(tripData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('to-do');
        });

        it('should return 400 if resources are unavailable (Overlapping Trip)', async () => {
            // create a trip overlapping with the one in beforeEach
            const conflictTrip = {
                truck: truckId, // Already booked in beforeEach
                trailer: trailerId,
                driver: driverId,
                startLocation: 'Conflict',
                endLocation: 'City',
                startDate: startDate, // Exact same dates
                endDate: endDate
            };

            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(conflictTrip);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already has a trip/i);
        });
    });

    describe('PATCH /api/trips/:id/start', () => {
        it('should start a trip and update resource statuses', async () => {
            const res = await request(app)
                .patch(`/api/trips/${tripId}/start`)
                .set('Authorization', `Bearer ${driverToken}`) // Drivers can start trips
                .send({ fuelStart: 500 });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('in-progress');
            expect(res.body.fuelStart).toBe(500);

            // Verify Side Effects
            const truck = await Truck.findById(truckId);
            const trailer = await Trailer.findById(trailerId);

            expect(truck.status).toBe('on_trip');
            expect(trailer.status).toBe('on_trip');
        });

        it('should fail if trip is not in "to-do" status', async () => {
            // Manually set trip to completed first
            await Trip.findByIdAndUpdate(tripId, { status: 'completed' });

            const res = await request(app)
                .patch(`/api/trips/${tripId}/start`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ fuelStart: 500 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PATCH /api/trips/:id/complete', () => {
        beforeEach(async () => {
            // move trip to 'in-progress' so we can complete it
            await Trip.findByIdAndUpdate(tripId, {
                status: 'in-progress',
                fuelStart: 500,
                kmStart: 10000
            });
        });

        it('should complete a trip and update mileage', async () => {
            const completionData = {
                fuelEnd: 300,
                kmEnd: 10500, // +500 km
                actualEndDate: new Date(),
                notes: 'Smooth delivery'
            };

            const res = await request(app)
                .patch(`/api/trips/${tripId}/complete`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send(completionData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('completed');
            expect(res.body.kmEnd).toBe(10500);

            // Verify Side Effects: Truck & Trailer Status
            const truck = await Truck.findById(truckId);
            const trailer = await Trailer.findById(trailerId);
            expect(truck.status).toBe('available');
            expect(trailer.status).toBe('available');

            // Verify Side Effects: Truck KM updated
            expect(truck.km).toBe(10500); // 10000 start + 500 trip

            // Verify Side Effects: Tire KM updated (Service check)
            const tire = await Tire.findById(tireId);
            expect(tire.km).toBe(5000 + 500); // 5000 start + 500 trip
        });

        it('should fail if kmEnd is less than kmStart', async () => {
            const res = await request(app)
                .patch(`/api/trips/${tripId}/complete`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({
                    fuelEnd: 300,
                    kmEnd: 9000, // Less than start (10000)
                    actualEndDate: new Date()
                });

            expect(res.statusCode).not.toBe(200);
        });
    });

    describe('GET /api/trips/:id/report', () => {
        it('should generate a PDF report', async () => {
            const res = await request(app)
                .get(`/api/trips/${tripId}/report`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toBe('application/pdf');
            expect(res.headers['content-disposition']).toMatch(/attachment; filename=Rapport_/);
        });

        it('should return 404 for non-existent trip', async () => {
            const fakeId = new User()._id;
            const res = await request(app)
                .get(`/api/trips/${fakeId}/report`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/trips', () => {
        it('should list trips (Admin)', async () => {
            const res = await request(app)
                .get('/api/trips')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trips.length).toBeGreaterThanOrEqual(1);
        });

        it('should filter by driver using search', async () => {
            const res = await request(app)
                .get('/api/trips?search=Driver')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.trips.length).toBeGreaterThanOrEqual(1);
        });
    });
});