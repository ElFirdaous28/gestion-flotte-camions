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
