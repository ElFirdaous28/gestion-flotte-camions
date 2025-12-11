import MaintenanceRecord from '../models/MaintenanceRecord.js';

export const createMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.create(req.body);
        res.status(201).json({ message: 'Maintenance record created successfully', record });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'A maintenance record for this target, rule, and date already exists.'
            });
        }
        next(err);
    }
};

export const getMaintenanceRecords = async (req, res, next) => {
    try {
        const records = await MaintenanceRecord.find().populate('rule').sort({ createdAt: -1 });
        res.json({ message: 'Maintenance records fetched successfully', records });
    } catch (err) {
        next(err);
    }
};

export const getMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findById(req.params.id).populate('rule');
        if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json({ message: 'Maintenance record fetched successfully', record });
    } catch (err) {
        next(err);
    }
};

export const updateMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, context: 'query' }
        );
        if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json({ message: 'Maintenance record updated successfully', record });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'A maintenance record for this target, rule, and date already exists.'
            });
        }
        next(err);
    }
};

export const deleteMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (err) {
        next(err);
    }
};
