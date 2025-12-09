import * as yup from 'yup';


export const createUserSchema = yup.object({
  fullname: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  role: yup
    .string()
    .oneOf(['admin', 'driver'], 'Role must be admin or driver')
    .required('Role is required'),
  avatar: yup.string().url('Avatar must be a valid URL').nullable(),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
});


export const updateUserSchema = yup.object({
  fullname: yup
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .optional(),
  email: yup
    .string()
    .email('Must be a valid email')
    .optional(),
  role: yup
    .string()
    .oneOf(['admin', 'driver'], 'Role must be admin or driver')
    .optional(),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters') // Added a min length for security if updating
    .optional(),
  avatar: yup
    .string()
    .url('Avatar must be a valid URL')
    .nullable()
    .optional(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'New password must be at least 6 characters').required(),
});