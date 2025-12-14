import * as yup from 'yup';

const positions = [
  'front-left',
  'front-right',
  'rear-left',
  'rear-right',
  'middle-left',
  'middle-right',
];

const statuses = [
  'stock',
  'mounted',
  'used',
  'needs_replacement',
  'out_of_service',
];

export const tireSchema = yup
  .object({
    truck: yup
      .string()
      .nullable()
      .transform(v => v === '' ? null : v),

    trailer: yup
      .string()
      .nullable()
      .transform(v => v === '' ? null : v),

    position: yup
      .string()
      .oneOf(positions, 'Invalid position')
      .required('Position is required'),

    brand: yup
      .string()
      .required('Brand is required'),

    model: yup
      .string()
      .required('Model is required'),

    size: yup
      .string()
      .required('Size is required'),

    status: yup
      .string()
      .oneOf(statuses, 'Invalid status')
      .required('Status is required'),

    purchaseDate: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value
      ),

    startUseDate: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value
      ),

    km: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value
      )
      .min(0, 'Kilometers cannot be negative'),
  })

  /* Truck OR Trailer (not both) */
  .test(
    'truck-trailer-exclusive',
    'A tire cannot be assigned to both a truck and a trailer',
    function (value) {
      if (value.truck && value.trailer) {
        return this.createError({
          path: 'truck',
          message: 'Choose either a truck or a trailer, not both',
        });
      }
      return true;
    }
  )

  /* Status vs assignment logic */
  .test(
    'status-consistency',
    'Invalid status for this assignment',
    function (value) {
      const hasVehicle = Boolean(value.truck || value.trailer);

      if (hasVehicle && !['mounted', 'used', 'needs_replacement'].includes(value.status)) {
        return this.createError({
          path: 'status',
          message: 'Assigned tires must be mounted, used, or need replacement',
        });
      }

      if (!hasVehicle && !['stock', 'out_of_service'].includes(value.status)) {
        return this.createError({
          path: 'status',
          message: 'Unassigned tires must be stock or out of service',
        });
      }

      return true;
    }
  );

export const UpdateTireStatusSchema = yup.object({
    status: yup.string().required('Status is required').oneOf(['stock', 'mounted', 'used', 'needs_replacement', 'out_of_service'])
});