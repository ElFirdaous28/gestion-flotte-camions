import mongoose from 'mongoose';
import { userFactory } from '../factories/user.factory.js';
import config from '../config/config.js';

const seedDB = async () => {
    try {
        // Connect to DB
        await mongoose.connect(config.MONGO_URI);

        // Clear DB
        await mongoose.connection.dropDatabase();
        console.log('Database cleared.');

        // Admin
        await userFactory(1, {
            fullname: 'Admin User',
            email: 'admin@gmail.com',
            password: 'password',
            role: 'admin',
        });

        // Driver
        await userFactory(1, {
            fullname: 'Jhon Dhoe',
            email: 'jhon@gmail.com',
            password: 'password',
            role: 'driver',
        });

        console.log('Database seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        await mongoose.connection.close();
    }
};

// Run the seeder
seedDB();
