import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

// Check if a resource has another trip at the same time
const hasOverlappingTrip = async (query, startDate, endDate) => {
    return Trip.exists({
        ...query,
        $or: [
            {
                startDate: { $lte: endDate },// Less Than or Equal
                endDate: { $gte: startDate } // Greater Than or Equal
            }
        ],
        status: { $ne: 'completed' } // ignore old trips
    });
};

export const validateTripResources = async (
    truckId,
    trailerId,
    driverId,
    startDate,
    endDate
) => {

    // Truck
    const truck = await Truck.findById(truckId);
    if (!truck) return { status: 404, message: 'Truck not found' };
    if (truck.status !== 'available')
        return { status: 400, message: 'Truck not available' };

    const truckConflict = await hasOverlappingTrip({ truck: truckId }, startDate, endDate);
    if (truckConflict) return { status: 400, message: 'Truck already has a trip in this period' };

    // Driver
    const driver = await User.findById(driverId);
    if (!driver) return { status: 404, message: 'Driver not found' };
    if (driver.role !== 'driver')
        return { status: 400, message: 'User is not a driver' };

    const driverConflict = await hasOverlappingTrip({ driver: driverId }, startDate, endDate);
    if (driverConflict) return { status: 400, message: 'Driver already has a trip in this period' };

    // Trailer
    const trailer = await Trailer.findById(trailerId);
    if (!trailer) return { status: 404, message: 'Trailer not found' };
    if (trailer.status !== 'available')
        return { status: 400, message: 'Trailer not available' };

    const trailerConflict = await hasOverlappingTrip({ trailer: trailerId }, startDate, endDate);
    if (trailerConflict) return { status: 400, message: 'Trailer already has a trip in this period' };

    return; // Valid
};
