import mongoose from 'mongoose';

const tireSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer' },

    position: {
        type: String,
        enum: ['front-left', 'front-right', 'rear-left', 'rear-right', 'middle-left', 'middle-right'],
    },

    brand: { type: String },
    model: { type: String },
    size: { type: String }, // e.g., "295/75 R22.5"

    status: {
        type: String,
        enum: [
            'stock',             // new tire in stock
            'mounted',           // currently installed on a vehicle
            'used',              // removed but still usable
            'needs_replacement', // worn, must be replaced soon
            'out_of_service'     // unusable / defective
        ],
        default: 'stock'
    },

    lastMaintenance: { type: Date },

    startUseDate: { type: Date },  // when tire started being used
    purchaseDate: Date,
    km: { type: Number, min: 0, default: 0 } // current accumulated km

}, { timestamps: true });

tireSchema.pre('save', function () {
    // at tire can not belong to both trailer and truck at one time
    if (this.truck && this.trailer) {
        throw new Error('A tire cannot be assigned to both a truck and a trailer.');
    }
    // if status is monte or use then tire sould be assigned to a truck or trailer
    const assignedStatuses = ['monte', 'use'];

    if (assignedStatuses.includes(this.status) && (!this.truck && !this.trailer)) {
        throw new Error(`A tire with status '${this.status}' must be assigned to a vehicle.`);
    }
});

export default mongoose.model('Tire', tireSchema);
