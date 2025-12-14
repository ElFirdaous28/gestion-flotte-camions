import * as yup from 'yup';

export const maintenanceRecordSchema = yup.object({
    targetType: yup
        .string()
        .oneOf(['truck', 'trailer', 'tire'], 'Target type must be truck, trailer, or tire')
        .required('Target type is required'),

    targetId: yup
        .string()
        .required('Target ID is required'),

    rule: yup
        .string()
        .required('Rule ID is required'),

    description: yup.string().optional(),

    performedAt: yup.date().optional(),

    kmAtMaintenance: yup
        .number()
        .min(0, 'kmAtMaintenance must be >= 0')
        .optional()
});
