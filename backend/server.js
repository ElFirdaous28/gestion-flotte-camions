import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import TruckRoutes from './routes/truck.routes.js';
import TrailerRoutes from './routes/trailer.routes.js';
import TripRoutes from './routes/trip.routes.js';
import TireRoutes from './routes/tire.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();
const PORT = config.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API Running'));

// DB connection
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT} in ${config.NODE_ENV} mode`);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trucks', TruckRoutes);
app.use('/api/trailers', TrailerRoutes);
app.use('/api/trips', TripRoutes);
app.use('/api/tires', TireRoutes);

app.use(errorHandler)
