import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { truckSchema } from "../../validation/truckSchema";

export default function TruckModal({ isOpen, onClose, onSubmit, truckToEdit }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm({
        resolver: yupResolver(truckSchema),
        defaultValues: truckToEdit || {},
    });

    useEffect(() => {
        if (isOpen) {
            reset(truckToEdit ? truckToEdit : {
                plateNumber: '',
                brand: '',
                model: '',
                km: 0,
                purchaseDate: '',
                lastMaintenance: '',
                towingCapacity: 0,
                status: 'available'
            });
        }
    }, [isOpen, truckToEdit, reset]);

    const handleFormSubmit = async (data) => {        
        try {
            await onSubmit(data);
            toast.success(truckToEdit ? "Truck updated" : "Truck added");
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
                        {truckToEdit ? 'Edit Truck' : 'Add New Truck'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Plate & Brand */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Plate Number</label>
                            <input {...register("plateNumber")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. 1234-A-56" />
                            {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Brand</label>
                            <input {...register("brand")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. Volvo" />
                            {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                        </div>

                        {/* Model & KM */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Model</label>
                            <input {...register("model")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. FH16" />
                            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Kilometers</label>
                            <input type="number" {...register("km")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            {errors.km && <p className="text-red-500 text-xs mt-1">{errors.km.message}</p>}
                        </div>

                        {/* Dates */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Purchase Date</label>
                            <input type="date" {...register("purchaseDate")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Last Maintenance</label>
                            <input type="date" {...register("lastMaintenance")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                        </div>

                        {/* Capacity & Status */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Towing Capacity (Tons)</label>
                            <input type="number" {...register("towingCapacity")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            {errors.towingCapacity && <p className="text-red-500 text-xs mt-1">{errors.towingCapacity.message}</p>}
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
                            className="px-4 py-2 rounded-lg texttext transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Truck'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};