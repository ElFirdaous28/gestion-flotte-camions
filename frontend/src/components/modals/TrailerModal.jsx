import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { trailerSchema } from "../../validation/trailerSchema";

export default function TrailerModal({ isOpen, onClose, onSubmit, trailerToEdit }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm({
        resolver: yupResolver(trailerSchema),
        defaultValues: trailerToEdit || {},
    });

    useEffect(() => {
        if (isOpen) {
            reset(trailerToEdit ? trailerToEdit : {
                plateNumber: '',
                type: '',
                maxLoad: 0,
                purchaseDate: '',
                lastMaintenance: '',
                status: 'available'
            });
        }
    }, [isOpen, trailerToEdit, reset]);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            toast.success(trailerToEdit ? "Trailer updated" : "Trailer added");
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                Object.keys(errors).forEach((field) => {
                    setError(field, { type: "manual", message: errors[field] });
                });
            } else {
                toast.error(err.response?.data?.message || "Something went wrong");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text">
                    <h3 className="text-xl font-semibold">
                        {trailerToEdit ? 'Edit Trailer' : 'Add New Trailer'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Plate & Type */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Plate Number</label>
                            <input {...register("plateNumber")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. TR-1234" />
                            {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Type</label>
                            <input {...register("type")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. Flatbed, Box" />
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                        </div>

                        {/* Max Load & Purchase Date */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Max Load (kg)</label>
                            <input type="number" {...register("maxLoad")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            {errors.maxLoad && <p className="text-red-500 text-xs mt-1">{errors.maxLoad.message}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Purchase Date</label>
                            <input type="date" {...register("purchaseDate")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>}
                        </div>

                        {/* Last Maintenance & Status */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Last Maintenance</label>
                            <input type="date" {...register("lastMaintenance")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Status</label>
                            <select
                                {...register("status")}
                                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                            >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                                <option value="on_trip">On Trip</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Trailer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};