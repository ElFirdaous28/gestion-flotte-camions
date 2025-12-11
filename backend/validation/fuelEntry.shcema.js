import * as yup from 'yup';
import mongoose from 'mongoose';

export const FuelEntrySchema = yup.object({
    trip: yup
        .string()
        .required('Trip is required')
        .test('is-objectid', 'Invalid trip ID', value => mongoose.Types.ObjectId.isValid(value)),

    amount: yup
        .number()
        .required('Fuel amount is required')
        .min(0, 'Amount must be >= 0'),

    invoiceSerial: yup
        .string()
        .required('Invoice serial is required')
});

export const UpdateFuelEntrySchema = yup.object({
    amount: yup.number().min(0),
    invoiceSerial: yup.string()
});
