import * as yup from 'yup';

const statusEnum = ['available', 'on_trip', 'maintenance', 'unavailable'];

export const trailerSchema = yup.object({
    plateNumber: yup
        .string()
        .required('Plate number is required')
        .min(3, 'Plate number must be at least 3 characters'),

    type: yup
        .string()
        .required('Type is required'),

    maxLoad: yup
        .number()
        .required('Max load is required')
        .min(0, 'Max load cannot be negative'),

    purchaseDate: yup
        .date()
        .required('Purchase date is required')
        .transform((value, originalValue) => originalValue === '' ? null : value),

    lastMaintenance: yup
        .date()
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value),

    status: yup
        .string()
        .oneOf(statusEnum, 'Invalid status')
        .default('available')
});

export const updateTrailerStatusSchema = yup.object({
    status: yup
        .string()
        .required('Status is required')
        .oneOf(statusEnum, 'Invalid status')
});
