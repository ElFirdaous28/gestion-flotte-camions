import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startLocation: String,
    endLocation: String,
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['to-do', 'in-progress', 'completed'], default: 'to-do' },
    plannedFuel: Number,   // <-- new: liters planned for the trip
    fuelStart: Number, // liters at trip start
    fuelEnd: Number,   // liters at trip end
    notes: String,
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
