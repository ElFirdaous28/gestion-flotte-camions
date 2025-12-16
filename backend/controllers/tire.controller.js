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
        let {
            page = 1,
            limit = 10,
            search,
            status,
            sort = 'createdAt',
            order = 'desc',
            truck,
            trailer
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        // Validation: cannot provide both truck and trailer
        if (truck && trailer) {
            return res.status(400).json({
                message: "You cannot provide both 'truck' and 'trailer' at the same time."
            });
        }

        const filter = {};
        if (truck) filter.truck = truck;
        if (trailer) filter.trailer = trailer;
        if (status) filter.status = status;

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { brand: regex },
                { model: regex },
                { position: regex },
            ];
        }

        const skip = (page - 1) * limit;

        const [tires, total] = await Promise.all([
            Tire.find(filter)
                .populate('truck', 'plateNumber brand model')
                .populate('trailer', 'plateNumber type')
                .sort({ [sort]: order === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            Tire.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Tires fetched successfully',
            tires,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
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

        tire.brand = req.body.brand;
        tire.model = req.body.model;
        tire.size = req.body.size;
        tire.position = req.body.position;
        tire.status = req.body.status;
        tire.km = req.body.km;
        tire.purchaseDate = req.body.purchaseDate;
        tire.startUseDate = req.body.startUseDate;

        tire.truck = req.body.truck || null;
        tire.trailer = req.body.trailer || null;

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
