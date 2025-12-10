import Trailer from '../models/Trailer.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import { updateTruckAndTiresKm } from '../services/updateTruckAndTiresKm.js';
import { validateTripResources } from '../services/validateTripResources.js';

export const getTrips = async (req, res, next) => {
    try {
        const trips = await Trip.find()
            .populate('truck trailer')
            .populate({ path: 'driver', select: '-password' });
        ;
        res.status(200).json(trips);
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
        const { fuelEnd, kmEnd, notes } = req.body;
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