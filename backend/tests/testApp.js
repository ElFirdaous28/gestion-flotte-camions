import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from '../routes/auth.routes.js';
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
app.use('/api/auth', authRoutes);

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

export default app;
