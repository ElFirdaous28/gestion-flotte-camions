import * as yup from 'yup';


export const userSchema = yup.object({
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
  avatar: yup.mixed().nullable(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'New password must be at least 6 characters').required(),
});