import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema({
    targetType: { type: String, enum: ['truck', 'trailer', 'tire'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceRule', required: true },
    description: { type: String },
    performedAt: { type: Date, default: Date.now},
    kmAtMaintenance: { type: Number, min: 0 },
}, { timestamps: true });

// prevent duplicate record for same target + rule + performedAt date
maintenanceRecordSchema.index({ targetId: 1, rule: 1, performedAt: 1 }, { unique: true });

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
