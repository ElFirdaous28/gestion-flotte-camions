import FuelEntry from '../models/FuelEntry.js';
import Trip from '../models/Trip.js';

export const createFuelEntry = async (req, res, next) => {
    try {
        const { trip } = req.body;

        // check that trip exists
        const foundTrip = await Trip.findById(trip);
        if (!foundTrip)
            return res.status(404).json({ message: 'Trip not found' });

        // trip must be in-progress
        if (foundTrip.status !== 'in-progress')
            return res.status(400).json({ message: 'Fuel entries can only be added to trips in-progress' });

        // create entry
        const fuelEntry = await FuelEntry.create(req.body);
        res.status(201).json(fuelEntry);

    } catch (err) {
        next(err);
    }
};

export const getFuelEntries = async (req, res, next) => {
    try {
        const entries = await FuelEntry.find();
        res.status(200).json(entries);
    } catch (err) {
        next(err);
    }
};

export const getFuelEntry = async (req, res, next) => {
    try {
        const entry = await FuelEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Fuel entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        next(err);
    }
};

export const updateFuelEntry = async (req, res, next) => {
    try {
        const entry = await FuelEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entry) return res.status(404).json({ message: 'Fuel entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        next(err);
    }
};

export const deleteFuelEntry = async (req, res, next) => {
    try {
        const entry = await FuelEntry.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Fuel entry not found' });
        res.status(200).json({ message: 'Fuel entry deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const getFuelEntriesByTrip = async (req, res, next) => {
    try {
        const { tripId } = req.params;

        const entries = await FuelEntry.find({ trip: tripId });
        if (!entries || entries.length === 0) {
            return res.status(404).json({ message: 'No fuel entries found for this trip' });
        }

        res.status(200).json(entries);
    } catch (err) {
        next(err);
    }
};