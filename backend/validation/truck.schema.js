import * as yup from 'yup';

const statusEnum = ['available', 'unavailable', 'on_trip', 'maintenance'];

export const createTruckSchema = yup.object({
    plateNumber: yup
        .string()
        .required('Plate number is required')
        .min(6, 'Plate number must be at least 6 characters'),

    brand: yup.string().required(),
    model: yup.string().required(),

    km: yup
        .number()
        .min(0, 'Kilometers cannot be negative')
        .default(0),

    purchaseDate: yup.date().required(),

    lastMaintenance: yup.date().optional(),

    towingCapacity: yup
        .number()
        .required()
        .min(0, 'Towing capacity cannot be negative'),

    status: yup
        .string()
        .oneOf(statusEnum, 'Invalid status')
        .default('available')
});


export const updateTruckSchema = yup.object({
    plateNumber: yup.string().min(6),
    brand: yup.string(),
    model: yup.string(),
    km: yup.number().min(0),
    purchaseDate: yup.date(),
    lastMaintenance: yup.date(),
    towingCapacity: yup.number().min(0),
    status: yup.string().oneOf(statusEnum)
});

export const updateTruckStatusSchema = yup.object({
    status: yup
        .string()
        .required('Status is required')
        .oneOf(statusEnum, 'Invalid status')
});
