import * as yup from 'yup';

const tripTypes = ['delivery', 'pickup', 'transfer', 'other'];
const tripStatus = ['to-do', 'in-progress', 'completed'];

export const tripSchema = yup.object({
    truck: yup
        .string()
        .required('Truck is required'),

    trailer: yup
        .string()
        .required('Trailer is required'),

    driver: yup
        .string()
        .required('Driver is required'),

    startLocation: yup.string().required('Start location is required').max(100),
    endLocation: yup.string().required('End location is required').max(100),

    startDate: yup.date().required('Start date is required'),
    endDate: yup.date()
        .required('End date is required')
        .test('after-start', 'End date must be after start date', function (value) {
            const { startDate } = this.parent;
            return startDate && value && new Date(value) > new Date(startDate);
        }),

    actualEndDate: yup.date().nullable(),

    status: yup.string().oneOf(tripStatus).default('to-do'),

    plannedFuel: yup.number().min(0).nullable(),
    fuelStart: yup.number().min(0).nullable(),
    fuelEnd: yup.number().min(0).nullable(),

    kmStart: yup.number().min(0).nullable(),
    kmEnd: yup.number().min(0).nullable()
        .test('km-end', 'kmEnd must be >= kmStart', function (value) {
            const { kmStart } = this.parent;
            return kmStart == null || value == null || value >= kmStart;
        }),

    type: yup.string().oneOf(tripTypes).default('delivery'),
    cargoWeight: yup.number().min(0).nullable(),
    description: yup.string().max(500).nullable(),
    notes: yup.string().max(500).nullable(),

}).test('status-based-validation', 'Invalid fields for selected status', function (value) {
    const { status, startDate, endDate, actualEndDate, fuelStart, fuelEnd, kmEnd, notes, description } = value;
    const now = new Date();

    if (status === 'to-do') {
        if (fuelStart || fuelEnd || kmEnd || actualEndDate || notes) {
            return this.createError({
                path: 'status',
                message: 'To-do trips cannot have fuelStart, fuelEnd, kmEnd, actualEndDate, or notes'
            });
        }
    } else if (status === 'in-progress') {
        if (!fuelStart) {
            return this.createError({ path: 'fuelStart', message: 'fuelStart is required for in-progress trips' });
        }
        if (fuelEnd || kmEnd || actualEndDate) {
            return this.createError({
                path: 'status',
                message: 'In-progress trips cannot have fuelEnd, kmEnd, or actualEndDate'
            });
        }
        if (startDate > now) {
            return this.createError({ path: 'startDate', message: 'Start date must be in the past for in-progress trips' });
        }
    } else if (status === 'completed') {
        if (!fuelStart || !fuelEnd || !kmEnd || !actualEndDate) {
            return this.createError({ path: 'status', message: 'Completed trips must have fuelStart, fuelEnd, kmEnd, and actualEndDate' });
        }
        if (startDate > now || endDate > now || actualEndDate > now) {
            return this.createError({ path: 'status', message: 'All dates must be in the past for completed trips' });
        }
    }

    return true;
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
        .min(0, 'fuelEnd must be >= 0')
        .transform((value, originalValue) =>
            originalValue === '' ? null : value
        ),
    kmEnd: yup
        .number()
        .required('kmEnd is required')
        .min(0, 'kmEnd must be >= 0')
        .transform((value, originalValue) =>
            originalValue === '' ? null : value
        ),
    actualEndDate: yup
        .date()
        .required('Actual End Date is required')
        .typeError('actualEndDate must be a valid date')
        .transform((value, originalValue) =>
            originalValue === '' ? null : value
        ),
    notes: yup.string().nullable(),
});