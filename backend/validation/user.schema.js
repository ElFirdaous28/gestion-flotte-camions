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
