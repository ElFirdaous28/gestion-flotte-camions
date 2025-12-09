import mongoose from 'mongoose';

const maintenanceRuleSchema = new mongoose.Schema({
    target: { type: String, enum: ['truck', 'trailer', 'tire'], required: true },
    intervalType: { type: String, enum: ['km', 'days'], required: true },
    intervalValue: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('MaintenanceRule', maintenanceRuleSchema);
