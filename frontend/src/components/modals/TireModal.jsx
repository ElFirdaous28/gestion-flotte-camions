import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { tireSchema } from "../../validation/tireSchema";
import Select from 'react-select';
import { useTrucks } from "../../hooks/useTrucks";
import { useTrailers } from "../../hooks/useTrailers";


const selectStyles = {
    control: ({ isFocused } = {}) =>
        `!bg-surface !border-border !rounded-lg !min-h-[42px] shadow-sm ${isFocused ? '!ring-2 !ring-primary/50 !border-primary' : ''}`,
    menu: () =>
        "!bg-surface border border-border mt-1 rounded-md shadow-lg z-50",
    option: ({ isSelected, isFocused } = {}) => {
        if (isSelected) return "!bg-primary !text-white";
        if (isFocused) return "!bg-background !text-text cursor-pointer";
        return "!bg-surface !text-text";
    },

    singleValue: () => "!text-text",
    input: () => "!text-text",
};

export default function TireModal({ isOpen, onClose, onSubmit, tireToEdit }) {
    const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting }, reset, setError } = useForm({
        resolver: yupResolver(tireSchema),
        mode: 'onBlur',
        defaultValues: tireToEdit || {},
    });

    const { trucksQuery } = useTrucks({ page: 1, limit: 100 });
    const { trailersQuery } = useTrailers({ page: 1, limit: 100 });

    const truckOptions = trucksQuery.data?.trucks?.map(t => ({
        value: t._id,
        label: `${t.plateNumber} • ${t.brand} ${t.model}`,
    })) || [];

    const trailerOptions = trailersQuery.data?.trailers?.map(t => ({
        value: t._id,
        label: `${t.plateNumber} • ${t.type}`,
    })) || [];

    useEffect(() => {
        if (isOpen) {
            if (tireToEdit) {
                const formValues = { ...tireToEdit };
                if (formValues.truck && typeof formValues.truck === 'object') {
                    formValues.truck = formValues.truck._id;
                }

                if (formValues.trailer && typeof formValues.trailer === 'object') {
                    formValues.trailer = formValues.trailer._id;
                }
                if (formValues.purchaseDate) {
                    formValues.purchaseDate = formValues.purchaseDate.split('T')[0];
                }
                if (formValues.startUseDate) {
                    formValues.startUseDate = formValues.startUseDate.split('T')[0];
                }

                reset(formValues);
            } else {
                // Default values for New Tire
                reset({
                    brand: '',
                    model: '',
                    size: '',
                    position: '',
                    status: 'stock',
                    km: 0,
                    purchaseDate: '',
                    startUseDate: '',
                    truck: null,
                    trailer: null
                });
            }
        }
    }, [isOpen, tireToEdit, reset]);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            toast.success(tireToEdit ? "Tire updated" : "Tire added");
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.keys(backendErrors).forEach((field) => {
                    setError(field, { type: "manual", message: backendErrors[field] });
                });
            } else {
                toast.error(err.response?.data?.message || "Something went wrong");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text shrink-0">
                    <h3 className="text-xl font-semibold">{tireToEdit ? 'Edit Tire' : 'Add New Tire'}</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form id="tire-form" onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Standard Inputs */}
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Brand</label>
                                <input {...register("brand")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. Michelin" />
                                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Model</label>
                                <input {...register("model")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. X Multi" />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Size</label>
                                <input {...register("size")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" placeholder="e.g. 295/75 R22.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Position</label>
                                <select {...register("position")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface">
                                    <option value="">Select Position</option>
                                    <option value="front-left">Front Left</option>
                                    <option value="front-right">Front Right</option>
                                    <option value="rear-left">Rear Left</option>
                                    <option value="rear-right">Rear Right</option>
                                    <option value="middle-left">Middle Left</option>
                                    <option value="middle-right">Middle Right</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Status</label>
                                <select {...register("status")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface">
                                    <option value="stock">Stock</option>
                                    <option value="mounted">Mounted</option>
                                    <option value="used">Used</option>
                                    <option value="needs_replacement">Needs Replacement</option>
                                    <option value="out_of_service">Out of Service</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Kilometers</label>
                                <input type="number" {...register("km")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Purchase Date</label>
                                <input type="date" {...register("purchaseDate")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Start Use Date</label>
                                <input type="date" {...register("startUseDate")} className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface" />
                            </div>

                            <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                                <h4 className="text-sm font-bold text-text mb-3">Assignment (Select only one or none)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Truck Controller */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Assign to Truck</label>
                                        <Controller
                                            name="truck"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    classNames={selectStyles}
                                                    options={truckOptions}
                                                    isClearable
                                                    placeholder="Search truck..."
                                                    value={truckOptions.find(c => c.value === field.value) || null}
                                                    onChange={(val) => {
                                                        field.onChange(val ? val.value : null);
                                                        if (val) setValue("trailer", null);
                                                    }}
                                                />
                                            )}
                                        />
                                        <p className="text-red-500 text-xs">{errors.truck?.message}</p>
                                    </div>

                                    {/* Trailer Controller */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Assign to Trailer</label>
                                        <Controller
                                            name="trailer"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    classNames={selectStyles}
                                                    options={trailerOptions}
                                                    isClearable
                                                    placeholder="Search trailer..."
                                                    value={trailerOptions.find(c => c.value === field.value) || null}
                                                    onChange={(val) => {
                                                        field.onChange(val ? val.value : null);
                                                        if (val) setValue("truck", null);
                                                    }}
                                                />
                                            )}
                                        />
                                        <p className="text-red-500 text-xs">{errors.trailer?.message}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0 bg-surface">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text transition-colors">Cancel</button>
                    <button type="submit" form="tire-form" disabled={isSubmitting} className="px-6 py-2 bg-primary text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save Tire'}
                    </button>
                </div>

            </div>
        </div>
    );
};