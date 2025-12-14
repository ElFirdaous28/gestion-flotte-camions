import mongoose from 'mongoose';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Tire from '../models/Tire.js';

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
        const {
            page = 1,
            limit = 10,
            targetType,
            targetId,
            rule,
            sort = 'performedAt',
            order = 'desc',
            fromDate,
            toDate
        } = req.query;

        // Build filters
        const filter = {};
        if (targetType) filter.targetType = targetType;
        if (targetId) filter.targetId = targetId;
        if (rule) filter.rule = rule;

        // Date range filter
        if (fromDate || toDate) {
            filter.performedAt = {};
            if (fromDate) filter.performedAt.$gte = new Date(fromDate);
            if (toDate) filter.performedAt.$lte = new Date(toDate);
        }

        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            MaintenanceRecord.find(filter)
                .populate('rule', 'name intervalType intervalValue description')
                .sort({ [sort]: order === 'asc' ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            MaintenanceRecord.countDocuments(filter)
        ]);

        res.json({
            message: 'Maintenance records fetched successfully',
            records,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
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

export const getMaintenanceRecordsVehicle = async (req, res, next) => {
    try {
        const { truck, trailer, filter = "all" } = req.query;

        // must provide either truck or trailer
        if ((!truck && !trailer) || (truck && trailer)) {
            return res.status(400).json({ message: "Provide either 'truck' or 'trailer', but not both." });
        }

        const vehicleId = truck || trailer;

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ message: "Invalid ObjectId provided." });
        }

        const targetType = truck ? "truck" : "trailer";

        // fetch vehicle maintenance
        const vehiclePromise =
            filter === "all" || filter === "vehicle"
                ? MaintenanceRecord.find({ targetType, targetId: vehicleId }).populate("rule")
                : Promise.resolve([]);

        // fetch tires
        const tiresPromise =
            filter === "all" || filter === "tires"
                ? Tire.find(truck ? { truck: vehicleId } : { trailer: vehicleId })
                : Promise.resolve([]);

        const [vehicleRecords, tires] = await Promise.all([vehiclePromise, tiresPromise]);

        let mergedTireRecords = [];

        if (tires.length > 0) {
            const tireIds = tires.map(t => t._id);

            const tireRecords = await MaintenanceRecord.find({
                targetType: "tire",
                targetId: { $in: tireIds }
            }).populate("rule");

            // Merge tires + their maintenance
            mergedTireRecords = tires.map(tire => {
                const t = tire.toObject();
                t.maintenances = tireRecords.filter(r => r.targetId.toString() === tire._id.toString());
                return t;
            });
        }

        return res.status(200).json({
            message: "Maintenance records fetched successfully",
            vehicleRecords,
            tireRecords: mergedTireRecords
        });

    } catch (err) {
        next(err);
    }
};
