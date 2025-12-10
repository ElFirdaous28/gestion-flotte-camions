import * as yup from 'yup';
import mongoose from 'mongoose';

const tripTypes = ['delivery', 'pickup', 'transfer', 'other'];
const tripStatus = ['to-do', 'in-progress', 'completed'];

export const TripSchema = yup.object({
    truck: yup
        .string()
        .required('Truck is required')
        .test('is-objectid', 'Invalid truck ID', value => mongoose.Types.ObjectId.isValid(value)),

    trailer: yup
        .string()
        .required('Trailer is required')
        .test('is-objectid', 'Invalid trailer ID', value => !value || mongoose.Types.ObjectId.isValid(value)),

    driver: yup
        .string()
        .required('Driver is required')
        .test('is-objectid', 'Invalid driver ID', value => mongoose.Types.ObjectId.isValid(value)),

    startLocation: yup.string().required('Start location is required'),
    endLocation: yup.string().required('End location is required'),

    startDate: yup.date().required('Start date is required'),

    endDate: yup.date()
        .required('End date is required')
        .test('after-start', 'End date must be after start date', function (value) {
            const { startDate } = this.parent;
            return startDate && value && new Date(value) > new Date(startDate);
        }),

    status: yup.string().oneOf(tripStatus).default('to-do'),

    plannedFuel: yup.number().min(0).nullable(),
    fuelStart: yup.number().min(0).nullable(),
    fuelEnd: yup.number().min(0).nullable(),

    kmEnd: yup.number().min(0).nullable(),

    type: yup.string().oneOf(tripTypes).default('delivery'),
    cargoWeight: yup.number().min(0).nullable(),
    description: yup.string().nullable(),
    notes: yup.string().nullable()
});

export const StartTripSchema = yup.object({
    fuelStart: yup
        .number()
        .required('fuelStart is required')
        .min(0, 'fuelStart must be >= 0'),
});

export const CompleteTripSchema = yup.object({
    fuelEnd: yup
        .number()
        .required('fuelEnd is required')
        .min(0, 'fuelEnd must be >= 0'),
    kmEnd: yup
        .number()
        .required('kmEnd is required')
        .min(0, 'kmEnd must be >= 0'),
    notes: yup.string().nullable(),
});