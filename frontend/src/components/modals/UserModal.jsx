import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzone } from 'react-dropzone';
import { X, Upload } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { userSchema } from '../../validation/userSchema';
import { toast } from 'react-toastify';

export default function UserModal({ isOpen, onClose, userToEdit }) {
  const { createUser, updateUser } = useUsers();
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: { fullname: '', email: '', role: 'driver', avatar: null },
  });

  const isLoading = userToEdit
    ? updateUser.isPending
    : createUser.isPending;

  // Dropzone Logic
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      setValue('avatar', file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  // Populate form
  useEffect(() => {
    if (userToEdit) {
      reset({
        fullname: userToEdit.fullname || '',
        email: userToEdit.email || '',
        role: userToEdit.role || 'driver',
        avatar: null,
      });
      setPreview(userToEdit?.avatar ? `${import.meta.env.VITE_API_URL}${userToEdit.avatar}` : null);
    } else {
      reset({ fullname: '', email: '', role: 'driver', avatar: null });
      setPreview(null);
    }
  }, [userToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (userToEdit) {
        // --- UPDATE: FormData for Image Support ---
        const formData = new FormData();
        formData.append('fullname', data.fullname);
        formData.append('email', data.email);
        formData.append('role', data.role);

        if (data.avatar instanceof File) {
          formData.append('avatar', data.avatar);
        }
        const res = await updateUser.mutateAsync({ id: userToEdit._id, data: formData });
        toast.success(res.data.message)
      } else {
        const { avatar, ...createData } = data;
        const res = await createUser.mutateAsync(createData);
        toast.success(res.data.message);
      }

      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key, { type: "server", message: backendErrors[key] });
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg w-full max-w-lg p-6 relative shadow-lg border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-text">
          {userToEdit ? 'Edit User' : 'Create User'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fullname */}
          <div>
            <label className="block mb-1 text-text font-medium">Fullname</label>
            <input
              type="text"
              {...register('fullname')}
              className={`w-full px-4 py-2 bg-background text-text rounded-lg border ${errors.fullname ? 'border-red-500' : 'border-border'
                } focus:outline-none focus:ring-2 focus:border-primary`}
            />
            <p className="text-red-500 text-xs mt-1">{errors.fullname?.message || ' '}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-text font-medium">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 bg-background text-text rounded-lg border ${errors.email ? 'border-red-500' : 'border-border'
                } focus:outline-none focus:ring-2 focus:border-primary`}
            />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message || ' '}</p>
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-text font-medium">Role</label>
            <select
              {...register('role')}
              className={`w-full px-4 py-2 bg-background text-text rounded-lg border ${errors.role ? 'border-red-500' : 'border-border'
                } focus:outline-none focus:ring-2 focus:border-primary`}
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-red-500 text-xs mt-1">{errors.role?.message || ' '}</p>
          </div>

          {/* Avatar Dropzone - ONLY SHOW IF EDITING */}
          {userToEdit && (
            <div>
              <label className="block mb-1 text-text font-medium">Avatar</label>
              <div
                {...getRootProps()}
                className={`w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive
                  ? 'border-primary bg-background/50'
                  : 'border-border hover:border-primary hover:bg-background/30'
                  }`}
              >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center gap-2">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-full border-2 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center border border-border text-muted">
                      <Upload size={32} />
                    </div>
                  )}
                  <p className="text-sm text-muted">
                    {isDragActive ? "Drop image here..." : "Drag & drop or click to select"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-primary text-white font-semibold rounded-lg transition shadow-md
              ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}
              `}
              >
            {isLoading
              ? userToEdit
                ? 'Updating user...'
                : 'Creating user...'
              : userToEdit
                ? 'Update User'
                : 'Create User'}
          </button>

        </form>
      </div>
    </div>
  );
}