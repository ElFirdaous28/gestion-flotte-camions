import mongoose from 'mongoose';

const maintenanceRuleSchema = new mongoose.Schema({
    target: { type: String, enum: ['truck', 'trailer', 'tire'], required: true },
    intervalType: { type: String, enum: ['km', 'days'], required: true },
    intervalValue: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

// prevent duplicate rules with same target + intervalType + intervalValue
maintenanceRuleSchema.index({ target: 1, intervalType: 1, intervalValue: 1 }, { unique: true });

export default mongoose.model('MaintenanceRule', maintenanceRuleSchema);
