import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { MaintenanceRuleSchema } from "../../validation/maintenanceRuleSchema";

export default function MaintenanceRuleModal({ isOpen, onClose, onSubmit, ruleToEdit }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm({
        resolver: yupResolver(MaintenanceRuleSchema),
        defaultValues: ruleToEdit || {},
    });

    useEffect(() => {
        if (isOpen) {
            reset(ruleToEdit ? ruleToEdit : {
                target: 'truck',
                intervalType: 'km',
                intervalValue: '',
                description: ''
            });
        }
    }, [isOpen, ruleToEdit, reset]);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            toast.success(ruleToEdit ? "Rule updated" : "Rule created");
            onClose();
        } catch (err) {
            // Backend returns field-specific errors
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.entries(backendErrors).forEach(([field, message]) => {
                    setError(field, { type: "manual", message });
                });
            }
            // Backend returns a general error message
            else if (err.response?.data?.message) {
                setError("general", { type: "manual", message: err.response.data.message });
            }
            else {
                toast.error("Something went wrong");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text">
                    <h3 className="text-xl font-semibold">
                        {ruleToEdit ? 'Edit Maintenance Rule' : 'Add New Rule'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
                    <div className="grid grid-cols-1 gap-6">

                        {/* Target */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Target Asset</label>
                            <select
                                {...register("target")}
                                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                            >
                                <option value="">Select Target</option>
                                <option value="truck">Truck</option>
                                <option value="trailer">Trailer</option>
                                <option value="tire">Tire</option>
                            </select>
                            {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target.message}</p>}
                        </div>

                        {/* Interval Type & Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Interval Value</label>
                                <input
                                    type="number"
                                    {...register("intervalValue")}
                                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                                    placeholder="e.g. 10000"
                                />
                                {errors.intervalValue && <p className="text-red-500 text-xs mt-1">{errors.intervalValue.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Unit</label>
                                <select
                                    {...register("intervalType")}
                                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                                >
                                    <option value="km">Kilometers (km)</option>
                                    <option value="days">Days</option>
                                </select>
                                {errors.intervalType && <p className="text-red-500 text-xs mt-1">{errors.intervalType.message}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className='block text-sm font-medium text-text mb-1'>Description</label>
                            <textarea
                                {...register("description")}
                                rows="3"
                                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface resize-none"
                                placeholder="e.g. Oil change and filter replacement"
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                        </div>

                        {errors.general && (
                            <p className="text-red-500 text-sm mb-4">{errors.general.message}</p>
                        )}

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
                            {isSubmitting ? 'Saving...' : 'Save Rule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};