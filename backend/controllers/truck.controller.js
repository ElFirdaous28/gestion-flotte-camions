import Truck from '../models/Truck.js';

export const getTrucks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [trucks, total] = await Promise.all([
      Truck.find(filter)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Truck.countDocuments(filter)
    ]);

    res.status(200).json({
      message: 'Trucks fetched successfully',
      trucks,
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
