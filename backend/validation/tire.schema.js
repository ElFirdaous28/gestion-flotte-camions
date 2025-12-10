import * as yup from 'yup';
import mongoose from 'mongoose';

export const CreateTireSchema = yup.object({
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
});

export const UpdateTireSchema = yup.object({
    truck: yup.string().nullable().test('is-objectid', 'Invalid truck ID', val => !val || mongoose.Types.ObjectId.isValid(val)),
    trailer: yup.string().nullable().test('is-objectid', 'Invalid trailer ID', val => !val || mongoose.Types.ObjectId.isValid(val)),
    position: yup.string().oneOf(['front-left', 'front-right', 'rear-left', 'rear-right', 'middle-left', 'middle-right']),
    brand: yup.string(),
    model: yup.string(),
    size: yup.string(),
    status: yup.string().oneOf(['stock', 'mounted', 'used', 'needs_replacement', 'out_of_service']),
    purchaseDate: yup.date().nullable(),
    startUseDate: yup.date().nullable(),
    km: yup.number().min(0).nullable()
});

export const UpdateTireStatusSchema = yup.object({
    status: yup.string().required('Status is required').oneOf(['stock', 'mounted', 'used', 'needs_replacement', 'out_of_service'])
});
