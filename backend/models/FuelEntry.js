import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    amount: Number, // liters
    invoiceUrl: { type: String },// onlyyyyyyyyyyyyyyyyyyyyyyy image!!!!!!   or onlyyy invoice id
    invoiceType: { type: String, enum: ['pdf', 'image'] }
}, { timestamps: true });

export default mongoose.model('FuelLog', fuelLogSchema);
