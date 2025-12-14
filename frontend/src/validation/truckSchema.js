import * as yup from 'yup';

const statusEnum = ['available', 'unavailable', 'on_trip', 'maintenance'];

export const truckSchema = yup.object({
    plateNumber: yup
        .string()
        .required('Plate number is required')
        .min(6, 'Plate number must be at least 6 characters'),

    brand: yup.string().required(),
    model: yup.string().required(),

    km: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .min(0, 'Kilometers cannot be negative')
        .default(0),

    purchaseDate:
        yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .required(),

    lastMaintenance:
        yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .nullable()
            .optional(),

    towingCapacity: yup
        .number('Towing capacity must be a number')
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .required()
        .min(0, 'Towing capacity cannot be negative'),

    status: yup
        .string()
        .oneOf(statusEnum, 'Invalid status')
        .default('available')
});


export const updateTruckStatusSchema = yup.object({
    status: yup
        .string()
        .required('Status is required')
        .oneOf(statusEnum, 'Invalid status')
});
