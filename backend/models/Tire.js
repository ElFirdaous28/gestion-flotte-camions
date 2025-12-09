import mongoose from 'mongoose';

const tireSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer' },
    position: {
        type: String,
        enum: ['front-left', 'front-right', 'rear-left', 'rear-right', 'middle-left', 'middle-right'],
        required: true
    },
    brand: { type: String },
    model: { type: String },
    size: { type: String },      // e.g., "295/75 R22.5"
    status: { type: String, enum: ['new', 'used', 'needs-replacement'], default: 'new' },
    lastMaintenance: { type: Date },
}, { timestamps: true });

// Custom validation: tire must belong to exactly one vehicle (truck OR trailer)
tireSchema.pre('save', function (next) {
    if ((this.truck && this.trailer) || (!this.truck && !this.trailer)) {
        return next(new Error('Tire must belong to exactly one truck or one trailer.'));
    }
    next();
});

export default mongoose.model('Tire', tireSchema);