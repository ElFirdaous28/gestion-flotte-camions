import request from 'supertest';
import app from './testApp.js';
import MaintenanceRule from '../models/MaintenanceRule.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Maintenance Rule Controller', () => {
    let adminToken;
    let driverToken;
    let ruleId;

    // Standard Rule Data
    const ruleData = {
        target: 'truck',
        intervalType: 'km',
        intervalValue: 10000,
        description: 'Oil Change every 10k km'
    };

    beforeEach(async () => {
        // reate Users
        const admin = await User.create({
            fullname: 'Admin User',
            email: 'admin@rules.com',
            password: 'pass',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const driver = await User.create({
            fullname: 'Driver User',
            email: 'driver@rules.com',
            password: 'pass',
            role: 'driver'
        });
        driverToken = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, { expiresIn: '1h' });

        // create a Rule
        const rule = await MaintenanceRule.create(ruleData);
        ruleId = rule._id;
    });

    describe('POST /api/maintenance-rules', () => {
        it('should create a new maintenance rule (Admin)', async () => {
            const newRule = {
                target: 'trailer',
                intervalType: 'days',
                intervalValue: 365,
                description: 'Annual Inspection'
            };

            const res = await request(app)
                .post('/api/maintenance-rules')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newRule);

            expect(res.statusCode).toBe(201);
            expect(res.body.rule.target).toBe('trailer');
            expect(res.body.rule.intervalValue).toBe(365);
        });

        it('should prevent duplicate rules (Unique Compound Index)', async () => {
            const res = await request(app)
                .post('/api/maintenance-rules')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(ruleData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/rule with this target, type, and value already exists/i);
        });

        it('should fail for Non-Admin users', async () => {
            const res = await request(app)
                .post('/api/maintenance-rules')
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ target: 'tire', intervalType: 'km', intervalValue: 50000 });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/maintenance-rules', () => {
        it('should list all rules (Admin)', async () => {
            const res = await request(app)
                .get('/api/maintenance-rules')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.rules.length).toBeGreaterThanOrEqual(1);
        });

        it('should deny access to Non-Admins', async () => {
            const res = await request(app)
                .get('/api/maintenance-rules')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/maintenance-rules/:id', () => {
        it('should fetch a single rule by ID', async () => {
            const res = await request(app)
                .get(`/api/maintenance-rules/${ruleId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.rule.target).toBe('truck');
        });

        it('should return 404 for non-existent ID', async () => {
            const fakeId = new User()._id;
            const res = await request(app)
                .get(`/api/maintenance-rules/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/maintenance-rules/:id', () => {
        it('should update a rule successfully', async () => {
            const res = await request(app)
                .put(`/api/maintenance-rules/${ruleId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ target: 'truck' })
                .send({ intervalType: 'km' })
                .send({ intervalValue: 15000 });
           
            expect(res.statusCode).toBe(200);

            // Refetch to verify
            const updated = await MaintenanceRule.findById(ruleId);
            expect(updated.intervalValue).toBe(15000);
        });

        it('should prevent updating a rule to become a duplicate of another', async () => {
            // create a second rule
            await MaintenanceRule.create({
                target: 'tire',
                intervalType: 'km',
                intervalValue: 50000
            });

            // rry to update our main rule (truck/10k) to match the second rule (tire/50k)
            const res = await request(app)
                .put(`/api/maintenance-rules/${ruleId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    target: 'tire',
                    intervalType: 'km',
                    intervalValue: 50000
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already exists/i);
        });
    });

    describe('DELETE /api/maintenance-rules/:id', () => {
        it('should delete a rule successfully', async () => {
            const res = await request(app)
                .delete(`/api/maintenance-rules/${ruleId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const check = await MaintenanceRule.findById(ruleId);
            expect(check).toBeNull();
        });

        it('should fail delete for Non-Admin', async () => {
            const res = await request(app)
                .delete(`/api/maintenance-rules/${ruleId}`)
                .set('Authorization', `Bearer ${driverToken}`);

            expect([401, 403]).toContain(res.statusCode);
        });
    });
});