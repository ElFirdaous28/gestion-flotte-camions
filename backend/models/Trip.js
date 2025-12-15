import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    trailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trailer', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualEndDate: { type: Date },

    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'completed', 'cancelled'],
        default: 'to-do'
    },

    plannedFuel: { type: Number, min: 0 },
    fuelStart: { type: Number, min: 0 },
    fuelEnd: { type: Number, min: 0 },

    kmStart: { type: Number, min: 0 },
    kmEnd: { type: Number, min: 0 },

    type: {
        type: String,
        enum: ['delivery', 'pickup', 'transfer', 'other'],
        default: 'delivery'
    },

    cargoWeight: { type: Number, min: 0 },
    description: { type: String },
    notes: { type: String }

}, { timestamps: true });

tripSchema.pre('save', async function (next) {
    // km validation
    if (this.kmEnd != null && this.kmStart != null && this.kmEnd < this.kmStart) {
        return next(new Error('kmEnd must be greater than or equal to kmStart'));
    }

    // date validation
    if (this.endDate && this.startDate && this.endDate <= this.startDate) {
        return next(new Error('endDate must be after startDate'));
    }

    // status-based field validation
    if (this.status === 'in-progress' && this.fuelStart == null) {
        return next(new Error('In-progress trips must have fuelStart'));
    }

    if (this.status === 'completed') {
        if (this.fuelStart == null || this.fuelEnd == null || this.kmEnd == null || this.actualEndDate == null) {
            return next(new Error('Completed trips must have fuelStart, fuelEnd, kmEnd, and actualEndDate'));
        }
    }

    // Generate serial number if missing
    if (!this.serialNumber) {
        const lastTrip = await this.constructor.findOne().sort({ createdAt: -1 });
        const lastNumber = lastTrip?.serialNumber?.split('-')[1] || 0;
        this.serialNumber = `TRIP-${parseInt(lastNumber) + 1}`;
    }
});


export default mongoose.model('Trip', tripSchema);
