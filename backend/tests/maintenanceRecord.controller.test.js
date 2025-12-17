import request from 'supertest';
import app from './testApp.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import MaintenanceRule from '../models/MaintenanceRule.js';
import Truck from '../models/Truck.js';
import Tire from '../models/Tire.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Maintenance Record Controller', () => {
    let adminToken;
    let driverToken;
    let truckId;
    let tireId;
    let ruleId;
    let recordId;

    // Initial values
    const initialTruckKm = 10000;
    const initialTireKm = 5000;

    beforeEach(async () => {
        // create Users
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@maint.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@maint.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });

        // create Resources (Truck & Linked Tire)
        const truck = await Truck.create({
            plateNumber: 'TR-MAINT-01',
            brand: 'Volvo',
            model: 'FH',
            purchaseDate: new Date(),
            towingCapacity: 40000,
            km: initialTruckKm,
            status: 'available'
        });
        truckId = truck._id;

        const tire = await Tire.create({
            brand: 'Michelin',
            model: 'X',
            size: '22.5',
            position: 'front-left',
            truck: truckId, // Linked to truck
            km: initialTireKm,
            status: 'used'
        });
        tireId = tire._id;

        // create a Maintenance Rule
        const rule = await MaintenanceRule.create({
            target: 'truck',
            intervalType: 'km',
            intervalValue: 1000,
            description: 'General Checkup'
        });
        ruleId = rule._id;
    });

    describe('POST /api/maintenance-records', () => {
        it('should create record and update vehicle KM (Side Effect)', async () => {
            const kmToAdd = 500;
            const newRecord = {
                targetType: 'truck',
                targetId: truckId,
                rule: ruleId,
                description: 'Routine Check',
                kmAtMaintenance: kmToAdd,
                performedAt: new Date()
            };

            const res = await request(app)
                .post('/api/maintenance-records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newRecord);

            expect(res.statusCode).toBe(201);
            expect(res.body.record.kmAtMaintenance).toBe(kmToAdd);

            // verify that truck km added
            const updatedTruck = await Truck.findById(truckId);
            expect(updatedTruck.km).toBe(initialTruckKm + kmToAdd);

            const updatedTire = await Tire.findById(tireId);
            expect(updatedTire.km).toBe(initialTireKm + kmToAdd);
        });

        it('should return 400 for duplicate record (Same target/rule/date)', async () => {
            const date = new Date('2024-01-01');
            const data = {
                targetType: 'truck',
                targetId: truckId,
                rule: ruleId,
                performedAt: date,
                kmAtMaintenance: 100
            };

            // First creation
            await request(app).post('/api/maintenance-records').set('Authorization', `Bearer ${adminToken}`).send(data);

            // Duplicate creation
            const res = await request(app)
                .post('/api/maintenance-records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(data);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already exists/i);
        });
    });

    describe('GET /api/maintenance-records/vehicle', () => {
        beforeEach(async () => {
            // create a record for the Truck
            await MaintenanceRecord.create({
                targetType: 'truck',
                targetId: truckId,
                rule: ruleId,
                description: 'Truck Record'
            });

            // create a record for the Tire
            const tireRule = await MaintenanceRule.create({ target: 'tire', intervalType: 'days', intervalValue: 30 });
            await MaintenanceRecord.create({
                targetType: 'tire',
                targetId: tireId,
                rule: tireRule._id,
                description: 'Tire Record'
            });
        });

        it('should return both vehicle and tire records when filtering by truck', async () => {
            const res = await request(app)
                .get(`/api/maintenance-records/vehicle?truck=${truckId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);

            // check Vehicle Records
            expect(res.body.vehicleRecords.length).toBe(1);
            expect(res.body.vehicleRecords[0].description).toBe('Truck Record');

            // check Tire Records 
            expect(res.body.tireRecords.length).toBeGreaterThan(0);
            const tireData = res.body.tireRecords.find(t => t._id === tireId.toString());
            expect(tireData).toBeDefined();
            expect(tireData.maintenances.length).toBe(1);
            expect(tireData.maintenances[0].description).toBe('Tire Record');
        });

        it('should return 400 if both truck and trailer provided', async () => {
            const res = await request(app)
                .get(`/api/maintenance-records/vehicle?truck=${truckId}&trailer=${truckId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /api/maintenance-records/:id', () => {
        beforeEach(async () => {
            // Create initial record with 100km
            const record = await MaintenanceRecord.create({
                targetType: 'truck',
                targetId: truckId,
                rule: ruleId,
                kmAtMaintenance: 100 // this would have added 100km to truck in a real flow, but here we just seed DB
            });
            recordId = record._id;

            await Truck.findByIdAndUpdate(truckId, { $inc: { km: 100 } });
        });

        it('should update record and adjust KM by difference', async () => {
            // Current Truck KM = 10100 (10000 + 100)

            // Update record: Change 100 -> 150 (Diff = +50)
            const res = await request(app)
                .put(`/api/maintenance-records/${recordId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ targetType: 'truck' })
                .send({ rule: ruleId })
                .send({ targetId: truckId })
                .send({ kmAtMaintenance: 150 });

            expect(res.statusCode).toBe(200);
            expect(res.body.record.kmAtMaintenance).toBe(150);

            // Verify Side Effect: Truck should increase by 50
            const updatedTruck = await Truck.findById(truckId);
            // Expected: 10100 + 50 = 10150
            expect(updatedTruck.km).toBe(initialTruckKm + 100 + 50);
        });

        it('should ignore negative KM changes', async () => {
            // attempt to decrease kmAtMaintenance
            const res = await request(app)
                .put(`/api/maintenance-records/${recordId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    targetType: 'truck',
                    rule: ruleId,
                    targetId: truckId,
                    kmAtMaintenance: 50 // lower than existing 100
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.record.kmAtMaintenance).toBe(50);

            // Truck KM should NOT decrease
            const updatedTruck = await Truck.findById(truckId);
            expect(updatedTruck.km).toBe(initialTruckKm + 100); // unchanged
        });
    });

    describe('DELETE /api/maintenance-records/:id', () => {
        beforeEach(async () => {
            const record = await MaintenanceRecord.create({
                targetType: 'truck',
                targetId: truckId,
                rule: ruleId,
                kmAtMaintenance: 100
            });
            recordId = record._id;
        });

        it('should delete a record successfully', async () => {
            const res = await request(app)
                .delete(`/api/maintenance-records/${recordId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const check = await MaintenanceRecord.findById(recordId);
            expect(check).toBeNull();
        });
    });
});