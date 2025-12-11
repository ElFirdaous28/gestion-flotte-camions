import * as yup from 'yup';
import mongoose from 'mongoose';

export const MaintenanceRuleSchema = yup.object({
    target: yup
        .string()
        .oneOf(['truck', 'trailer', 'tire'], 'Target must be truck, trailer, or tire')
        .required('Target is required'),

    intervalType: yup
        .string()
        .oneOf(['km', 'days'], 'Interval type must be km or days')
        .required('Interval type is required'),

    intervalValue: yup
        .number()
        .required('Interval value is required')
        .min(1, 'Interval value must be at least 1'),

    description: yup
        .string()
        .optional()
});
