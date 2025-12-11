import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualEndDate: { type: Date },

    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'completed'],
        default: 'to-do'
    },

    plannedFuel: { type: Number, min: 0 },
    fuelStart: { type: Number, min: 0 },
    fuelEnd: { type: Number, min: 0 },

    kmStart: { type: Number, min: 0 },
    kmEnd: { type: Number, min: 0 },

    type: {
        type: String,
        enum: ['delivery', 'pickup', 'transfer', 'other'],
        default: 'delivery'
    },

    cargoWeight: { type: Number, min: 0 },
    description: { type: String },
    notes: { type: String }

}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
