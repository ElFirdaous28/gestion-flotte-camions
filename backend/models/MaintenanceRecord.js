import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema({
    targetType: { type: String, enum: ['truck', 'trailer', 'tire'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceRule', required: true },
    description: String,
    performedAt: { type: Date, default: Date.now },
    kmAtMaintenance: Number,
}, { timestamps: true });


export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
