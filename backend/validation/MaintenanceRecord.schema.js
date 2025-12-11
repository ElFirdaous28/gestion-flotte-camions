import * as yup from 'yup';
import mongoose from 'mongoose';

export const MaintenanceRecordSchema = yup.object({
    targetType: yup
        .string()
        .oneOf(['truck', 'trailer', 'tire'], 'Target type must be truck, trailer, or tire')
        .required('Target type is required'),

    targetId: yup
        .string()
        .required('Target ID is required')
        .test('is-objectid', 'Invalid target ID', value => mongoose.Types.ObjectId.isValid(value)),

    rule: yup
        .string()
        .required('Rule ID is required')
        .test('is-objectid', 'Invalid rule ID', value => mongoose.Types.ObjectId.isValid(value)),

    description: yup.string().optional(),

    performedAt: yup.date().optional(),

    kmAtMaintenance: yup
        .number()
        .min(0, 'kmAtMaintenance must be >= 0')
        .optional()
});
