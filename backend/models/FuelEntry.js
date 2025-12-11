import mongoose from 'mongoose';

const fuelEntrySchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    amount: Number, // liters
    invoiceSerial: { type: String, required: true },

}, { timestamps: true });

fuelEntrySchema.index({ trip: 1, invoiceSerial: 1 }, { unique: true });

export default mongoose.model('FuelEntry', fuelEntrySchema);
