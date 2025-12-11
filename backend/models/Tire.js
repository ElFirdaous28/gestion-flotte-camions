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
    // a tire can not belong to both trailer and truck at one time
    if (this.truck && this.trailer) {
        throw new Error('A tire cannot be assigned to both a truck and a trailer.');
    }
    // if tire is assigned to a vehicle, status must be 'mounted' or 'used' or 'needs_replacement'
    if ((this.truck || this.trailer) && !['mounted', 'used', 'needs_replacement'].includes(this.status)) {
        this.status = 'mounted'; // default to mounted
    }

    // if tire is not assigned to a vehicle, cannot be mounted or used 
    if (!(this.truck || this.trailer) && ['mounted', 'used'].includes(this.status)) {
        throw new Error(`A tire with status '${this.status}' must be assigned to a truck or trailer.`);
    }
});

export default mongoose.model('Tire', tireSchema);
