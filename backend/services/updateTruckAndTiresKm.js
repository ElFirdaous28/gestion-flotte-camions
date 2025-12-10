import Truck from '../models/Truck.js';
import Tire from '../models/Tire.js';

export const updateTruckAndTiresKm = async (truckId, distance) => {
    // Update truck km
    const truck = await Truck.findById(truckId);
    if (!truck) throw new Error('Truck not found');

    truck.km += distance;
    await truck.save();
    console.log(truck);
    

    // Update all tires on this truck
    await Tire.updateMany({ truck: truckId }, { $inc: { km: distance } });

    return truck;
};
