import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Tire from '../models/Tire.js';
import Trailer from '../models/Trailer.js';
import Truck from '../models/Truck.js';

export const createTire = async (req, res, next) => {
    try {
        const { truck: truckId, trailer: trailerId } = req.body;

        // Check if truck exists
        if (truckId) {
            const truck = await Truck.findById(truckId);
            if (!truck) return res.status(400).json({ message: 'Referenced truck does not exist' });
        }

        // Check if trailer exists
        if (trailerId) {
            const trailer = await Trailer.findById(trailerId);
            if (!trailer) return res.status(400).json({ message: 'Referenced trailer does not exist' });
        }

        const tire = new Tire(req.body);
        await tire.save();
        res.status(201).json({ message: 'Tire created successfully', ...tire.toObject() });
    } catch (err) {
        next(err);
    }
};

export const getTires = async (req, res, next) => {
    try {
        const { truck, trailer } = req.query;

        // Validation: cannot provide both truck and trailer
        if (truck && trailer) {
            return res.status(400).json({
                message: "You cannot provide both 'truck' and 'trailer' at the same time."
            });
        }

        const filter = truck ? { truck } : trailer ? { trailer } : {};

        const tires = await Tire.find(filter);

        res.status(200).json({
            message: 'Tires fetched successfully',
            tires
        });
    } catch (err) {
        next(err);
    }
};

export const getTire = async (req, res, next) => {
    try {
        const { maintenance } = req.query;
        const tireDoc = await Tire.findById(req.params.id).populate('truck trailer');
        if (!tireDoc) return res.status(404).json({ message: 'Tire not found' });

        const tire = tireDoc.toObject();

        if (maintenance === 'true') {
            const records = await MaintenanceRecord.find({
                targetType: 'tire',
                targetId: tire._id
            }).populate('rule');
            tire.maintenances = records;
        }

        res.status(200).json({ message: 'Tire fetched successfully', ...tire });
    } catch (err) {
        next(err);
    }
};

export const updateTire = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id);
        if (!tire) return res.status(404).json({ message: 'Tire not found' });

        const { truck: truckId, trailer: trailerId } = req.body;

        // Check if truck exists
        if (truckId) {
            const truck = await Truck.findById(truckId);
            if (!truck) return res.status(400).json({ message: 'Referenced truck does not exist' });
        }

        // Check if trailer exists
        if (trailerId) {
            const trailer = await Trailer.findById(trailerId);
            if (!trailer) return res.status(400).json({ message: 'Referenced trailer does not exist' });
        }

        Object.assign(tire, req.body);
        await tire.save();

        res.status(200).json({ message: 'Tire updated successfully', ...tire.toObject() });
    } catch (err) {
        next(err);
    }
};

export const deleteTire = async (req, res, next) => {
    try {
        const tire = await Tire.findByIdAndDelete(req.params.id);
        if (!tire) return res.status(404).json({ message: 'Tire not found' });
        res.status(200).json({ message: 'Tire deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateTireStatus = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id);
        if (!tire) return res.status(404).json({ message: 'Tire not found' });

        tire.status = req.body.status;
        await tire.save();

        res.status(200).json(tire);
    } catch (err) {
        next(err);
    }
};

export const getAvailableTires = async (req, res, next) => {
    try {
        const tires = await Tire.find({
            truck: { $exists: false, $eq: null },
            trailer: { $exists: false, $eq: null },
            status: { $in: ['stock', 'used', 'needs_replacement'] }
        });

        res.status(200).json({
            message: "Available tires fetched successfully",
            tires
        });

    } catch (err) {
        next(err);
    }
};
