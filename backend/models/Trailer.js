import mongoose from 'mongoose';

const trailerSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    type: String,
    maxLoad: Number,
}, { timestamps: true });

export default mongoose.model('Trailer', trailerSchema);
