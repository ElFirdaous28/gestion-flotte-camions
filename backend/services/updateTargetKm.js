import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import Tire from '../models/Tire.js';

export const updateTargetKm = async ({ targetType, targetId, km }) => {
    if (!km || km <= 0) return;

    switch (targetType) {
        case 'truck': {
            const truck = await Truck.findByIdAndUpdate(
                targetId,
                { $inc: { km } },
                { new: true }
            );
            if (!truck) throw new Error('Truck not found');

            // update truck tires
            await Tire.updateMany({ truck: targetId }, { $inc: { km } });
            break;
        }

        case 'trailer': {
            const trailer = await Trailer.findByIdAndUpdate(
                targetId,
                { $inc: { km } },
                { new: true }
            );
            if (!trailer) throw new Error('Trailer not found');

            // update trailer tires
            await Tire.updateMany({ trailer: targetId }, { $inc: { km } });
            break;
        }

        case 'tire': {
            const tire = await Tire.findByIdAndUpdate(
                targetId,
                { $inc: { km } },
                { new: true }
            );
            if (!tire) throw new Error('Tire not found');
            break;
        }

        default:
            throw new Error('Invalid target type');
    }
};
