import Truck from '../models/Truck.js';

export const getTrucks = async (req, res, next) => {
    try {
        const trucks = await Truck.find();
        res.status(200).json(trucks);
    } catch (err) {
        next(err);
    }
};

export const getTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.id);
        if (!truck) return res.status(404).json({ message: 'Truck not found' });
        res.status(200).json(truck);
    } catch (err) {
        next(err);
    }
};

export const createTruck = async (req, res, next) => {
    try {
        const truck = await Truck.create(req.body);
        res.status(201).json(truck);
    } catch (err) {
        next(err);
    }
};

export const updateTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!truck) return res.status(404).json({ message: 'Truck not found' });
        res.status(200).json(truck);
    } catch (err) {
        next(err);
    }
};

export const deleteTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findByIdAndDelete(req.params.id);
        if (!truck) return res.status(404).json({ message: 'Truck not found' });
        res.status(200).json({ message: 'Truck deleted' });
    } catch (err) {
        next(err);
    }
};

export const updateTruckStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const truck = await Truck.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!truck)
            return res.status(404).json({ message: 'Truck not found' });

        res.status(200).json(truck);
    } catch (err) {
        next(err);
    }
};
