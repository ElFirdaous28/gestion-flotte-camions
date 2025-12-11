import MaintenanceRule from '../models/MaintenanceRule.js';

export const createMaintenanceRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.create(req.body);
        res.status(201).json({ message: 'Maintenance rule created successfully', data: rule });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'A maintenance rule with this target, type, and value already exists.'
            });
        }
        next(err);
    }
};

export const getMaintenanceRules = async (req, res, next) => {
    try {
        const rules = await MaintenanceRule.find().sort({ createdAt: -1 });
        res.json({ message: 'Maintenance rules fetched successfully', data: rules });
    } catch (err) {
        next(err);
    }
};

export const getMaintenanceRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.findById(req.params.id);
        if (!rule) return res.status(404).json({ message: 'Maintenance rule not found' });
        res.json({ message: 'Maintenance rule fetched successfully', data: rule });
    } catch (err) {
        next(err);
    }
};

export const updateMaintenanceRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.findByIdAndUpdate(
            req.params.id,
            req.body,
        );
        if (!rule) return res.status(404).json({ message: 'Maintenance rule not found' });
        res.json({ message: 'Maintenance rule updated successfully', data: rule });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'A maintenance rule with this target, type, and value already exists.'
            });
        }
        next(err);
    }
};

export const deleteMaintenanceRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ message: 'Maintenance rule not found' });
        res.json({ message: 'Maintenance rule deleted successfully' });
    } catch (err) {
        next(err);
    }
};
