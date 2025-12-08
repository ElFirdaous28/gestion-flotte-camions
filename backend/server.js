import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import config from './config/config.js'; // This will load env vars automatically

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
    console.log(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});