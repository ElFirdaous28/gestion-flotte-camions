import Tire from '../models/Tire.js';

export const createTire = async (req, res, next) => {
    try {
        const tire = new Tire(req.body);
        await tire.save();
        res.status(201).json(tire);
    } catch (err) {
        next(err);
    }
};

export const getTires = async (req, res, next) => {
    try {
        const tires = await Tire.find().populate('truck trailer');
        res.status(200).json(tires);
    } catch (err) {
        next(err);
    }
};

export const getTire = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id).populate('truck trailer');
        if (!tire) return res.status(404).json({ message: 'Tire not found' });
        res.status(200).json(tire);
    } catch (err) {
        next(err);
    }
};

export const updateTire = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id);
        if (!tire) return res.status(404).json({ message: 'Tire not found' });

        Object.assign(tire, req.body);
        await tire.save();

        res.status(200).json(tire);
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
