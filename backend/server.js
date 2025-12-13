import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import config from './config/config.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import TruckRoutes from './routes/truck.routes.js';
import TrailerRoutes from './routes/trailer.routes.js';
import TripRoutes from './routes/trip.routes.js';
import TireRoutes from './routes/tire.routes.js';
import FuelRoutes from './routes/fuelEntry.routes.js';
import MaintenanceRuleRoutes from './routes/maintenanceRule.routes.js';
import MaintenanceRecordRoutes from './routes/maintenanceRecord.routes.js';

import errorHandler from './middlewares/error.middleware.js';

const app = express();
const PORT = config.PORT || 3000;

/* ---------- MIDDLEWARES ---------- */
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

/* ---------- CORS ---------- */
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

/* ---------- DB + SERVER ---------- */
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
