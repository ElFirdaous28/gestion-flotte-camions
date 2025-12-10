import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },

    km: { type: Number, default: 0 },

    purchaseDate: { type: Date, required: true },
    lastMaintenance: { type: Date },
    towingCapacity: { type: Number, default: 0, required: true },  // how much weight the truck can pull (in kg)

    status: { type: String, enum: ['available', 'unavailable', 'on_trip', 'maintenance'], default: 'available' }
}, { timestamps: true });

export default mongoose.model('Truck', truckSchema);
