import Trailer from '../models/Trailer.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import { updateTruckAndTiresKm } from '../services/updateTruckAndTiresKm.js';
import { validateTripResources } from '../services/validateTripResources.js';
import User from '../models/User.js';

export const getTrips = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            search,
            order = 'desc'
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        // Search: driver fullname OR locations
        if (search) {
            // find matching drivers first
            const drivers = await User.find({
                fullname: { $regex: search, $options: 'i' }
            }).select('_id');

            filter.$or = [
                { startLocation: { $regex: search, $options: 'i' } },
                { endLocation: { $regex: search, $options: 'i' } },
                { driver: { $in: drivers.map(d => d._id) } }
            ];
        }

        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            Trip.find(filter)
                .populate('truck', 'plateNumber brand model')
                .populate('trailer', 'plateNumber type')
                .populate('driver', 'fullname email')
                .sort({ createdAt: order === 'asc' ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            Trip.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Trips fetched successfully',
            trips,
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

export const getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('truck trailer')
            .populate({ path: 'driver', select: '-password' });;
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

export const createTrip = async (req, res, next) => {
    try {
        const { truck, trailer, driver, startDate, endDate } = req.body;

        const error = await validateTripResources(
            truck,
            trailer,
            driver,
            new Date(startDate),
            new Date(endDate)
        );

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }
        const trip = await Trip.create(req.body);
        res.status(201).json(trip);

    } catch (err) {
        next(err);
    }
};

export const updateTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.status !== 'to-do') {
            return res.status(400).json({ message: "Only trips with status 'to-do' status can be updated" });
        }

        trip.set(req.body);
        await trip.save();

        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

export const deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const startTrip = async (req, res, next) => {
    try {
        const { fuelStart } = req.body;

        // Find trip
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Can only start a "to-do" trip
        if (trip.status !== 'to-do') {
            return res.status(400).json({ message: 'Only trips with status "to-do" can be started' });
        }

        const truck = await Truck.findById(trip.truck);

        if (!truck) return res.status(404).json({ message: 'Truck not found' });

        // Update trip
        trip.status = 'in-progress';
        trip.fuelStart = fuelStart;
        trip.kmStart = truck.km;

        await trip.save();

        await Truck.findByIdAndUpdate(trip.truck, { status: 'on_trip' });
        await Trailer.findByIdAndUpdate(trip.trailer, { status: 'on_trip' });

        res.status(200).json(trip);

    } catch (err) {
        next(err);
    }
};

export const completeTrip = async (req, res, next) => {
    try {
        const { fuelEnd, kmEnd, notes, actualEndDate } = req.body;
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // can only complete an in-progress trip
        if (trip.status !== 'in-progress') {
            return res.status(400).json({ message: "Only trips with status 'in-progress' can be completed" });
        }

        // update trip
        trip.status = 'completed';
        trip.fuelEnd = fuelEnd;
        trip.kmEnd = kmEnd;
        trip.actualEndDate = new Date(actualEndDate);
        if (notes) trip.notes = notes;

        await trip.save();

        await Truck.findByIdAndUpdate(trip.truck, { status: 'available' });
        await Trailer.findByIdAndUpdate(trip.trailer, { status: 'available' });

        const distance = kmEnd - trip.kmStart; // trip distance
        await updateTruckAndTiresKm(trip.truck, distance);
        res.status(200).json(trip);

    } catch (err) {
        next(err);
    }
};

export const getDriverTrips = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { driver: driverId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            Trip.find(filter)
                .populate('truck', 'plateNumber brand')
                .populate('trailer', 'plateNumber type')
                .populate('driver', 'fullname')
                .sort({ createdAt: -1 }) // Newest first
                .skip(Number(skip))
                .limit(Number(limit)),
            Trip.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Driver trips fetched successfully',
            trips,
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