import Trailer from '../models/Trailer.js';

export const getTrailers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Filters
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        // Search
        if (search) {
            filter.$or = [
                { plateNumber: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [trailers, total] = await Promise.all([
            Trailer.find(filter)
                .sort({ [sort]: order === 'asc' ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            Trailer.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Trailers fetched successfully',
            trailers,
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
