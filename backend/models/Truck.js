import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    model: String,
    km: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Truck', truckSchema);
