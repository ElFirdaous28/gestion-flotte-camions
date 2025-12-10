import Trailer from '../models/Trailer.js';

export const getTrailers = async (req, res, next) => {
    try {
        const trailers = await Trailer.find();
        res.status(200).json(trailers);
    } catch (err) {
        next(err);
    }
};

export const getTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.id);
        if (!trailer) return res.status(404).json({ message: 'Trailer not found' });
        res.status(200).json(trailer);
    } catch (err) {
        next(err);
    }
};

export const createTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.create(req.body);
        res.status(201).json(trailer);
    } catch (err) {
        next(err);
    }
};

export const updateTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!trailer) return res.status(404).json({ message: 'Trailer not found' });
        res.status(200).json(trailer);
    } catch (err) {
        next(err);
    }
};

export const deleteTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndDelete(req.params.id);
        if (!trailer) return res.status(404).json({ message: 'Trailer not found' });
        res.status(200).json({ message: 'Trailer deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateTrailerStatus = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!trailer) return res.status(404).json({ message: 'Trailer not found' });
        res.status(200).json(trailer);
    } catch (err) {
        next(err);
    }
};
