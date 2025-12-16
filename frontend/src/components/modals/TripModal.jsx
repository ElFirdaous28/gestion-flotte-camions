import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X, AlertCircle, Info } from 'lucide-react';
import Select from 'react-select';

// Import all your schemas
import { tripSchema, StartTripSchema, CompleteTripSchema } from "../../validation/tripSchema";
import { useTrucks } from "../../hooks/useTrucks";
import { useTrailers } from "../../hooks/useTrailers";
import { useUsers } from "../../hooks/useUsers";

export default function TripModal({ isOpen, onClose, onSubmit, tripToEdit, action = 'create' }) {

    // 1. DYNAMIC SCHEMA RESOLVER
    // We select the correct schema based on the user's action
    const currentSchema = useMemo(() => {
        if (action === 'start') return StartTripSchema;
        if (action === 'complete') return CompleteTripSchema;
        return tripSchema; // for 'create' and 'update'
    }, [action]);

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: yupResolver(currentSchema),
        defaultValues: tripToEdit || {},
    });

    // Fetch resources
    const { trucksQuery } = useTrucks({ limit: 100, status: 'available' });
    const { trailersQuery } = useTrailers({ limit: 100, status: 'available' });
    const { usersQuery } = useUsers({ role: 'driver', limit: 100 });

    const truckOptions = trucksQuery.data?.trucks?.map(t => ({
        value: t._id, label: `${t.plateNumber} • ${t.brand}`
    })) || [];

    const trailerOptions = trailersQuery.data?.trailers?.map(t => ({
        value: t._id, label: `${t.plateNumber} • ${t.type}`
    })) || [];

    const driverOptions = usersQuery.data?.users?.map(d => ({
        value: d._id, label: `${d.fullname}`
    })) || [];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            // 2. FIX DEFAULT VALUES
            // For 'create', fuelStart/End MUST be null, otherwise tripSchema fails "To-do trips cannot have..."
            const baseDefaults = {
                truck: null, trailer: null, driver: null,
                startLocation: '', endLocation: '',
                startDate: '', endDate: '',
                plannedFuel: 0, cargoWeight: 0,
                type: 'delivery', description: '', notes: '',
                // CRITICAL: Set these to null, not 0
                fuelStart: null,
                fuelEnd: null,
                kmEnd: null
            };

            if (tripToEdit) {
                reset({
                    ...baseDefaults,
                    ...tripToEdit,
                    truck: tripToEdit.truck?._id || tripToEdit.truck,
                    trailer: tripToEdit.trailer?._id || tripToEdit.trailer,
                    driver: tripToEdit.driver?._id || tripToEdit.driver,
                    startDate: tripToEdit.startDate?.split('T')[0],
                    endDate: tripToEdit.endDate?.split('T')[0],
                    // If starting, pre-fill inputs if needed, otherwise clean
                    fuelStart: action === 'start' ? (tripToEdit.fuelStart || '') : null,
                });
            } else {
                reset(baseDefaults);
            }
        }
    }, [isOpen, tripToEdit, reset, action]);

    const handleFormSubmit = async (data) => {
        try {
            // For 'create', ensure we clean up empty numbers to null to satisfy schema
            if (action === 'create' || action === 'update') {
                if (!data.plannedFuel) data.plannedFuel = null;
                if (!data.cargoWeight) data.cargoWeight = null;
            }

            await onSubmit(data);
            toast.success("Success");
            onClose();
        } catch (err) {
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("An error occurred");
            }
        }
    };

    // Styling
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--surface)',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
            borderWidth: '1px',
            boxShadow: 'none',
            minHeight: '42px',
            '&:hover': { borderColor: 'var(--primary)' },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--surface)',
            zIndex: 100
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'var(--primary)' : 'var(--surface)',
            color: 'var(--text)',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'var(--text)',
        }),
    };

    const getTitle = () => {
        if (action === 'start') return 'Start Trip';
        if (action === 'complete') return 'Complete Trip';
        if (action === 'update') return 'Edit Trip';
        return 'Plan New Trip';
    };

    if (!isOpen) return null;

    const isEditable = action === 'create' || (action === 'update' && tripToEdit?.status === 'to-do');
    const isStartMode = action === 'start';
    const isCompleteMode = action === 'complete';
    const isReadOnlyView = action === 'update' && tripToEdit?.status !== 'to-do';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col border border-border">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text shrink-0">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        {getTitle()}
                        {tripToEdit && <span className="text-sm opacity-75 font-normal">({tripToEdit.serialNumber})</span>}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
                </div>

                {/* Form Body */}
                <div className="overflow-y-auto flex-1 p-6">

                    {isReadOnlyView && (
                        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3 text-text">
                            <Info className="text-blue-500" />
                            <div>
                                <p className="font-semibold">View Only Mode</p>
                                <p className="text-sm opacity-80">You cannot edit this trip because it is currently <strong>{tripToEdit.status}</strong>.</p>
                            </div>
                        </div>
                    )}

                    <form id="trip-form" onSubmit={handleSubmit(handleFormSubmit)}>

                        {/* ---------------- CREATE / UPDATE ---------------- */}
                        {isEditable && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Resources */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Truck</label>
                                        <Controller name="truck" control={control} render={({ field }) => (
                                            <Select {...field} styles={selectStyles} options={truckOptions} placeholder="Select Truck"
                                                value={truckOptions.find(c => c.value === field.value)}
                                                onChange={val => field.onChange(val?.value)}
                                            />
                                        )} />
                                        <p className="text-red-500 text-xs">{errors.truck?.message}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trailer</label>
                                        <Controller name="trailer" control={control} render={({ field }) => (
                                            <Select {...field} styles={selectStyles} options={trailerOptions} placeholder="Select Trailer"
                                                value={trailerOptions.find(c => c.value === field.value)}
                                                onChange={val => field.onChange(val?.value)}
                                            />
                                        )} />
                                        <p className="text-red-500 text-xs">{errors.trailer?.message}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Driver</label>
                                        <Controller name="driver" control={control} render={({ field }) => (
                                            <Select {...field} styles={selectStyles} options={driverOptions} placeholder="Select Driver"
                                                value={driverOptions.find(c => c.value === field.value)}
                                                onChange={val => field.onChange(val?.value)}
                                            />
                                        )} />
                                        <p className="text-red-500 text-xs">{errors.driver?.message}</p>
                                    </div>
                                </div>

                                {/* Locations */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Location</label>
                                    <input {...register("startLocation")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                    <p className="text-red-500 text-xs">{errors.startLocation?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Location</label>
                                    <input {...register("endLocation")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                    <p className="text-red-500 text-xs">{errors.endLocation?.message}</p>
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input type="date" {...register("startDate")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                    <p className="text-red-500 text-xs">{errors.startDate?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date (Planned)</label>
                                    <input type="date" {...register("endDate")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                    <p className="text-red-500 text-xs">{errors.endDate?.message}</p>
                                </div>

                                {/* Details */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Trip Type</label>
                                    <select {...register("type")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50">
                                        <option value="delivery">Delivery</option>
                                        <option value="pickup">Pickup</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Planned Fuel (L)</label>
                                    <input type="number" {...register("plannedFuel")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                    <p className="text-red-500 text-xs">{errors.plannedFuel?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cargo Weight (kg)</label>
                                    <input type="number" {...register("cargoWeight")} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea {...register("description")} rows="3" className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" placeholder="Optional details..."></textarea>
                                </div>
                            </div>
                        )}

                        {/* ---------------- START TRIP ---------------- */}
                        {isStartMode && (
                            <div className="max-w-lg mx-auto">
                                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                                    <AlertCircle className="text-yellow-600 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-bold text-yellow-700">Starting Trip</p>
                                        <p className="text-yellow-800/80">Confirm the current fuel level to begin.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Fuel Level (L)</label>
                                    <input
                                        type="number"
                                        {...register("fuelStart", { valueAsNumber: true })}
                                        className="w-full px-4 py-3 text-lg rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="e.g. 450"
                                        autoFocus
                                    />
                                    <p className="text-red-500 text-xs mt-1">{errors.fuelStart?.message}</p>
                                </div>
                            </div>
                        )}

                        {/* ---------------- COMPLETE TRIP ---------------- */}
                        {isCompleteMode && (
                            <div className="max-w-lg mx-auto">
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3">
                                    <AlertCircle className="text-green-600 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-bold text-green-700">Completing Trip</p>
                                        <p className="text-green-700">Enter final metrics to close this trip.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">End KM</label>
                                            <input type="number" {...register("kmEnd", { valueAsNumber: true })} className="w-full px-4 py-3 text-lg rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                            <p className="text-red-500 text-xs">{errors.kmEnd?.message}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">End Fuel (L)</label>
                                            <input type="number" {...register("fuelEnd", { valueAsNumber: true })} className="w-full px-4 py-3 text-lg rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                            <p className="text-red-500 text-xs">{errors.fuelEnd?.message}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Actual End Date</label>
                                        <input type="date" {...register("actualEndDate")} defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" />
                                        <p className="text-red-500 text-xs">{errors.actualEndDate?.message}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trip Notes</label>
                                        <textarea {...register("notes")} rows="4" className="w-full px-4 py-2 rounded-lg border border-border bg-surface outline-none focus:ring-2 focus:ring-primary/50" placeholder="Any issues, delays..."></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0 bg-surface">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text hover:bg-black/5 transition-colors">Cancel</button>
                    {!isReadOnlyView && (
                        <button
                            type="submit"
                            form="trip-form"
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium
                                ${isStartMode ? 'bg-yellow-500 text-white' : isCompleteMode ? 'bg-green-600 text-white' : 'bg-primary'}
                            `}
                        >
                            {isSubmitting ? 'Processing...' : isStartMode ? 'Start Trip' : isCompleteMode ? 'Complete Trip' : 'Save Trip'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};