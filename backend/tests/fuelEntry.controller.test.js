import request from 'supertest';
import app from './testApp.js';
import FuelEntry from '../models/FuelEntry.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Fuel Entry Controller', () => {
    let adminToken;
    let tripId;
    let fuelEntryId;
    let truckId, trailerId, driverId;

    // create a dummy file for upload tests
    const dummyFilePath = path.join(__dirname, 'dummy_invoice.pdf');

    beforeAll(() => {
        // create a temporary dummy file
        fs.writeFileSync(dummyFilePath, 'Dummy PDF Content');
    });

    afterAll(() => {
        // cleanup dummy file
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
    });

    beforeEach(async () => {
        // create Users
        const admin = await User.create({
            fullname: 'Admin Fuel',
            email: 'admin@fuel.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const driver = await User.create({
            fullname: 'Driver Fuel',
            email: 'driver@fuel.com',
            password: 'pass',
            role: 'driver'
        });
        driverId = driver._id;

        // create resources
        const truck = await Truck.create({ plateNumber: 'TR-FUEL', brand: 'X', model: 'Y', purchaseDate: new Date(), towingCapacity: 1000, km: 1000, status: 'on_trip' });
        truckId = truck._id;
        const trailer = await Trailer.create({ plateNumber: 'TL-FUEL', type: 'box', maxLoad: 1000, purchaseDate: new Date(), status: 'on_trip' });
        trailerId = trailer._id;

        // create an "In-Progress" Trip (Required for adding fuel)
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 day

        const trip = await Trip.create({
            truck: truckId,
            trailer: trailerId,
            driver: driverId,
            startLocation: 'A',
            endLocation: 'B',
            startDate,
            endDate,
            status: 'in-progress',
            fuelStart: 500,
            kmStart: 1000
        });

        tripId = trip._id;

        // create an existing Fuel Entry
        const fuelEntry = await FuelEntry.create({
            trip: tripId,
            amount: 100,
            invoiceSerial: 'INV-001'
        });
        fuelEntryId = fuelEntry._id;
    });

    describe('POST /api/fuel', () => {
        it('should create a fuel entry with file upload successfully', async () => {
            const res = await request(app)
                .post('/api/fuel')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('invoiceFile', dummyFilePath)
                .field('trip', tripId.toString())
                .field('amount', 200)
                .field('invoiceSerial', 'INV-NEW-002');


            expect(res.statusCode).toBe(201);
            expect(res.body.amount).toBe(200);
            expect(res.body.invoiceFile).toBeDefined(); // should have a path
        });

        it('should fail if trip is NOT in-progress', async () => {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 day

            // create a To-Do trip
            const todoTrip = await Trip.create({
                truck: truckId,
                trailer: trailerId,
                driver: driverId,
                startLocation: 'X',
                endLocation: 'Y',
                startDate,
                endDate,
                status: 'to-do'
            });

            const res = await request(app)
                .post('/api/fuel')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('trip', todoTrip._id.toString())
                .field('amount', 50)
                .field('invoiceSerial', 'INV-FAIL');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/only be added to trips in-progress/i);
        });

        it('should fail if invoiceSerial is duplicate', async () => {
            const res = await request(app)
                .post('/api/fuel')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('trip', tripId.toString())
                .field('amount', 50)
                .field('invoiceSerial', 'INV-001'); // Already exists from beforeEach

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already been used/i);
        });
    });

    describe('GET /api/fuel', () => {
        it('should list all fuel entries (Admin)', async () => {
            const res = await request(app)
                .get('/api/fuel')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });


    describe('GET /api/fuel/trip/:tripId', () => {
        it('should list entries for a specific trip', async () => {
            const res = await request(app)
                .get(`/api/fuel/trip/${tripId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body[0].invoiceSerial).toBe('INV-001');
        });
    });

    describe('PUT /api/fuel/:id', () => {
        it('should update fuel entry details', async () => {
            const res = await request(app)
                .put(`/api/fuel/${fuelEntryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('trip', tripId.toString())
                .field('amount', 150)
                .field('invoiceSerial', 'INV-001-UPDATED');

            expect(res.statusCode).toBe(200);
            expect(res.body.amount).toBe(150);
            expect(res.body.invoiceSerial).toBe('INV-001-UPDATED');
        });

        it('should prevent update if trip is completed', async () => {
            // complete the trip
            await Trip.findByIdAndUpdate(tripId, { status: 'completed' });

            // try update
            const res = await request(app)
                .put(`/api/fuel/${fuelEntryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('trip', tripId.toString())
                .field('amount', 999)
                .field('invoiceSerial', 'INV-001-UPDATED');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Cannot update fuel entry for completed trip/i);
        });
    });

    describe('DELETE /api/fuel/:id', () => {
        it('should delete a fuel entry', async () => {
            const res = await request(app)
                .delete(`/api/fuel/${fuelEntryId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const check = await FuelEntry.findById(fuelEntryId);
            expect(check).toBeNull();
        });
    });
});