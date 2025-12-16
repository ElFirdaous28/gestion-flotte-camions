import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from '../routes/auth.routes.js';
import userRoutes from '../routes/user.routes.js';
import TruckRoutes from '../routes/truck.routes.js';
import TrailerRoutes from '../routes/trailer.routes.js';
import TripRoutes from '../routes/trip.routes.js';
import TireRoutes from '../routes/tire.routes.js';
import FuelRoutes from '../routes/fuelEntry.routes.js';
import MaintenanceRuleRoutes from '../routes/maintenanceRule.routes.js';
import MaintenanceRecordRoutes from '../routes/maintenanceRecord.routes.js';

import errorHandler from '../middlewares/error.middleware.js';

const app = express();

/* ---------- MIDDLEWARES ---------- */
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

/* ---------- ROUTES ---------- */
app.get('/', (req, res) => res.send('API Running'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trucks', TruckRoutes);
app.use('/api/trailers', TrailerRoutes);
app.use('/api/trips', TripRoutes);
app.use('/api/tires', TireRoutes);
app.use('/api/fuel', FuelRoutes);
app.use('/api/maintenance-rules', MaintenanceRuleRoutes);
app.use('/api/maintenance-records', MaintenanceRecordRoutes);


/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

export default app;
