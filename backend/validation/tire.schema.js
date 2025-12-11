import * as yup from 'yup';
import mongoose from 'mongoose';

export const TireSchema = yup.object({
    truck: yup.string().nullable().test('is-objectid', 'Invalid truck ID', val => !val || mongoose.Types.ObjectId.isValid(val)),
    trailer: yup.string().nullable().test('is-objectid', 'Invalid trailer ID', val => !val || mongoose.Types.ObjectId.isValid(val)),
    position: yup.string().oneOf(['front-left', 'front-right', 'rear-left', 'rear-right', 'middle-left', 'middle-right']),
    brand: yup.string().required('Brand is required'),
    model: yup.string().required('Model is required'),
    size: yup.string().required('Size is required'),
    status: yup.string().oneOf(['stock', 'mounted', 'used', 'needs_replacement', 'out_of_service']),
    purchaseDate: yup.date().nullable(),
    startUseDate: yup.date().nullable(),
    km: yup.number().min(0).nullable()
}).test('truck-trailer-mutual-exclusion', 'A tire cannot be assigned to both a truck and a trailer', function (value) {
    if (value.truck && value.trailer) {
        return this.createError({
            path: 'truck',
            message: 'A tire cannot be assigned to both a truck and a trailer'
        });
    }
    return true;
}).test('status-vehicle-consistency', 'Status must be consistent with vehicle assignment', function (value) {
    const hasVehicle = value.truck || value.trailer;
    const status = value.status;

    if (hasVehicle && status && !['mounted', 'used', 'needs_replacement'].includes(status)) {
        return this.createError({
            path: 'status',
            message: 'Tire assigned to a vehicle must have status: mounted, used, or needs_replacement'
        });
    }

    if (!hasVehicle && status && !['stock', 'out_of_service'].includes(status)) {
        return this.createError({
            path: 'status',
            message: 'Tire without a vehicle must have status: stock or out_of_service'
        });
    }

    return true;
});

export const UpdateTireStatusSchema = yup.object({
    status: yup.string().required('Status is required').oneOf(['stock', 'mounted', 'used', 'needs_replacement', 'out_of_service'])
});