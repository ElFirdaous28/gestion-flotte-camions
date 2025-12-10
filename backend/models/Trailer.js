import mongoose from 'mongoose';

const trailerSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., flatbed, box, refrigerated
    maxLoad: { type: Number, min: 0, required: true }, // in kg

    status: {
        type: String,
        enum: ['available', 'unavailable', 'on_trip', 'maintenance'],
        default: 'available'
    },

    purchaseDate: { type: Date, required: true },
    lastMaintenance: { type: Date },

}, { timestamps: true });

export default mongoose.model('Trailer', trailerSchema);
