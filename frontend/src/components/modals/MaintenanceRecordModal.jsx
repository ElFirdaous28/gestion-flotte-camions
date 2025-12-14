import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import Select from 'react-select';

// Imports for data loading
import { maintenanceRecordSchema } from "../../validation/maintenanceRecordSchema";
import { useTrucks } from "../../hooks/useTrucks";
import { useTrailers } from "../../hooks/useTrailers";
import { useTires } from "../../hooks/useTires";
import { useMaintenanceRules } from "../../hooks/useMaintenanceRules";

export default function MaintenanceRecordModal({ isOpen, onClose, onSubmit, recordToEdit }) {
    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting }, reset, setError } = useForm({
        resolver: yupResolver(maintenanceRecordSchema),
        defaultValues: recordToEdit || {},
    });

    // Fetch all necessary data
    // We fetch a larger limit to ensure dropdowns are populated. In a real large app, this should be async search.
    const { trucksQuery } = useTrucks({ limit: 100 });
    const { trailersQuery } = useTrailers({ limit: 100 });
    const { tiresQuery } = useTires({ limit: 100 });
    const { rulesQuery } = useMaintenanceRules();

    // Watch Target Type to switch dropdowns
    const targetType = watch("targetType");

    // Prepare Options
    const truckOptions = useMemo(() =>
        trucksQuery.data?.trucks?.map(t => ({ value: t._id, label: `${t.plateNumber} • ${t.brand}` })) || []
        , [trucksQuery.data]);

    const trailerOptions = useMemo(() =>
        trailersQuery.data?.trailers?.map(t => ({ value: t._id, label: `${t.plateNumber} • ${t.type}` })) || []
        , [trailersQuery.data]);

    const tireOptions = useMemo(() =>
        tiresQuery.data?.map(t => ({ value: t._id, label: `${t.brand} ${t.model} (${t.position || 'Stock'})` })) || []
        , [tiresQuery.data]);

    // Filter rules based on the selected target type
    const ruleOptions = useMemo(() => {
        const allRules = rulesQuery.data || [];
        // Only show rules that match the selected target type
        return allRules
            .filter(r => r.target === targetType)
            .map(r => ({
                value: r._id,
                label: `${r.description} (Every ${r.intervalValue} ${r.intervalType})`
            }));
    }, [rulesQuery.data, targetType]);

    // Dynamic Options based on type
    const currentTargetOptions =
        targetType === 'truck' ? truckOptions :
            targetType === 'trailer' ? trailerOptions :
                targetType === 'tire' ? tireOptions : [];

    // Reset logic
    useEffect(() => {
        if (isOpen) {
            reset(recordToEdit ? {
                ...recordToEdit,
                // Ensure Date is formatted for input
                performedAt: recordToEdit.performedAt ? new Date(recordToEdit.performedAt).toISOString().split('T')[0] : '',
                // Keep IDs for Selects
                rule: recordToEdit.rule?._id || recordToEdit.rule,
                targetId: recordToEdit.targetId,
            } : {
                targetType: 'truck',
                targetId: '',
                rule: '',
                description: '',
                performedAt: new Date().toISOString().split('T')[0],
                kmAtMaintenance: 0
            });
        }
    }, [isOpen, recordToEdit, reset]);

    // Clear targetId if targetType changes (unless we are initializing)
    useEffect(() => {
        if (isOpen && !recordToEdit) {
            setValue("targetId", ""); // Reset target selection when type changes
            setValue("rule", "");     // Reset rule selection when type changes
        }
    }, [targetType, setValue, isOpen, recordToEdit]);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            toast.success(recordToEdit ? "Record updated" : "Record added");
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                Object.keys(backendErrors).forEach((field) => {
                    setError(field, { type: "manual", message: backendErrors[field] });
                });
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--color-background)',
            borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-border)',
            boxShadow: 'none', // remove focus ring shadow
            minHeight: 42,
            '&:hover': { borderColor: 'var(--color-primary)' },
        }),
        valueContainer: (base) => ({ ...base, padding: '0 12px' }),
        input: (base) => ({ ...base, color: 'var(--color-text)' }),
        placeholder: (base) => ({ ...base, color: 'var(--color-text-muted)' }),
        singleValue: (base) => ({ ...base, color: 'var(--color-text)' }),
        menu: (base) => ({ ...base, backgroundColor: 'var(--color-background)', zIndex: 100 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'var(--color-primary)' // selected option color
                : state.isFocused
                    ? 'rgba(23, 114, 47, 0.15)' // hover/focus
                    : 'var(--color-background)',
            color: state.isSelected ? '#fff' : 'var(--color-text)',
            '&:active': { backgroundColor: state.isSelected ? 'var(--color-primary)' : 'rgba(23, 114, 47, 0.15)' },
        }),
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[85vh] flex flex-col">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text shrink-0">
                    <h3 className="text-xl font-semibold">
                        {recordToEdit ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form id="record-form" onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Target Type */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Target Type</label>
                                <div className="flex gap-4">
                                    {['truck', 'trailer', 'tire'].map((type) => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer bg-surface border border-border px-4 py-2 rounded-lg hover:border-primary transition-colors">
                                            <input
                                                type="radio"
                                                value={type}
                                                {...register("targetType")}
                                                className="accent-primary w-4 h-4"
                                            />
                                            <span className="capitalize font-medium">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Select Target (Dynamic) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-1">
                                    Select {targetType ? targetType.charAt(0).toUpperCase() + targetType.slice(1) : 'Target'}
                                </label>
                                <Controller
                                    name="targetId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            styles={selectStyles}
                                            options={currentTargetOptions}
                                            placeholder={`Search ${targetType}...`}
                                            noOptionsMessage={() => `No ${targetType}s found`}
                                            value={currentTargetOptions.find(c => c.value === field.value) || null}
                                            onChange={(val) => field.onChange(val ? val.value : '')}
                                        />
                                    )}
                                />
                                {errors.targetId && <p className="text-red-500 text-xs mt-1">{errors.targetId.message}</p>}
                            </div>

                            {/* Select Rule */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-1">Maintenance Rule</label>
                                <Controller
                                    name="rule"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            styles={selectStyles}
                                            options={ruleOptions}
                                            placeholder="Select rule..."
                                            noOptionsMessage={() => "No rules found for this target type"}
                                            value={ruleOptions.find(c => c.value === field.value) || null}
                                            onChange={(val) => field.onChange(val ? val.value : '')}
                                        />
                                    )}
                                />
                                {errors.rule && <p className="text-red-500 text-xs mt-1">{errors.rule.message}</p>}
                            </div>

                            {/* Date & KM */}
                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>Date Performed</label>
                                <input
                                    type="date"
                                    {...register("performedAt")}
                                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                                />
                                {errors.performedAt && <p className="text-red-500 text-xs mt-1">{errors.performedAt.message}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-text mb-1'>KM at Maintenance</label>
                                <input
                                    type="number"
                                    {...register("kmAtMaintenance")}
                                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface"
                                />
                                {errors.kmAtMaintenance && <p className="text-red-500 text-xs mt-1">{errors.kmAtMaintenance.message}</p>}
                            </div>

                            {/*  Description */}
                            <div className="md:col-span-2">
                                <label className='block text-sm font-medium text-text mb-1'>Notes / Description</label>
                                <textarea
                                    {...register("description")}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-surface resize-none"
                                    placeholder="Additional details..."
                                />
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0 bg-surface">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-text transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="record-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-primary text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Record'}
                    </button>
                </div>

            </div>
        </div>
    );
};