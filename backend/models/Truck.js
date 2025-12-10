import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    brand: { type: String },
    model: { type: String },

    km: { type: Number, default: 0 },

    purchaseDate: { type: Date },                  // date d’achat
    lastMaintenance: { type: Date },               // dernière maintenance
    towingCapacity: { type: Number, default: 0 },  // how much weight the truck can pull (in kg)

    status: { type: String, enum: ['available', 'unavailable', 'on_trip', 'maintenance'], default: 'available' }
}, { timestamps: true });

export default mongoose.model('Truck', truckSchema);
