import * as yup from 'yup';

export const fuelEntrySchema = yup.object({
    trip: yup
        .string()
        .required('Trip is required'),

    amount: yup
        .number()
        .required('Fuel amount is required')
        .min(0, 'Amount must be >= 0'),

    invoiceSerial: yup
        .string()
        .required('Invoice serial is required')
        .max(50, 'Invoice serial too long'),
    invoiceFile: yup
        .string()
        .url('Invoice file must be a valid URL')
        .nullable()

});
