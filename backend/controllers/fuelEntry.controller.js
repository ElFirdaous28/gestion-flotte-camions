import FuelEntry from '../models/FuelEntry.js';
import Trip from '../models/Trip.js';

export const createFuelEntry = async (req, res, next) => {
    try {
        const { trip, invoiceSerial, amount } = req.body;

        // check trip exists
        const foundTrip = await Trip.findById(trip);
        if (!foundTrip) return res.status(404).json({ message: 'Trip not found' });

        // Trip must be in-progress
        if (foundTrip.status !== 'in-progress') {
            return res.status(400).json({ message: 'Fuel entries can only be added to trips in-progress' });
        }

        // prevent duplicate invoiceSerial
        const existingInvoice = await FuelEntry.findOne({ invoiceSerial });
        if (existingInvoice) {
            return res.status(400).json({ message: 'This invoice has already been used' });
        }

        // create fuel entry including invoice file path
        const fuelEntry = await FuelEntry.create({
            trip,
            amount,
            invoiceSerial,
            invoiceFile: req.file?.path || null,
        });

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
        const entry = await FuelEntry.findById(req.params.id).populate('trip');
        if (!entry) return res.status(404).json({ message: 'Fuel entry not found' });

        // cannot update if trip is completed
        if (entry.trip.status === 'completed') {
            return res.status(400).json({ message: 'Cannot update fuel entry for completed trip' });
        }

        // if new file uploaded, delete old one
        if (req.file && entry.invoiceFile) {
            try { fs.unlinkSync(entry.invoiceFile); } catch (err) { console.warn('Old invoice not found'); }
            entry.invoiceFile = req.file.path;
        }

        // update fields
        Object.assign(entry, req.body);
        await entry.save();

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

        res.status(200).json(entries);
    } catch (err) {
        next(err);
    }
};