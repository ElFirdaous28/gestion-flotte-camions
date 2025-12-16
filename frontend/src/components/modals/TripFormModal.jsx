import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X, Info, MapPin, Box, Truck, Activity } from 'lucide-react';
import Select from 'react-select';
import { tripSchema } from "../../validation/tripSchema";
import { useTrucks } from "../../hooks/useTrucks";
import { useTrailers } from "../../hooks/useTrailers";
import { useUsers } from "../../hooks/useUsers";
import FuelLogManager from "./FuelLogManager";

export default function TripFormModal({ isOpen, onClose, tripToEdit, onCreate, onUpdate }) {

    // Default values for a NEW trip (Strictly 'to-do' compliant)
    const defaultValues = {
        truck: null, trailer: null, driver: null,
        startLocation: '', endLocation: '',
        startDate: '', endDate: '',
        plannedFuel: 0, cargoWeight: 0,
        type: 'delivery', description: '',
        status: 'to-do', // Explicitly set default status
        // These MUST be null/undefined for 'to-do' validation to pass
        fuelStart: undefined,
        fuelEnd: undefined,
        kmEnd: undefined,
        actualEndDate: undefined,
        notes: undefined
    };

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: yupResolver(tripSchema),
        defaultValues: defaultValues,
    });

    const { trucksQuery } = useTrucks({ limit: 100, status: 'available' });
    const { trailersQuery } = useTrailers({ limit: 100, status: 'available' });
    const { usersQuery } = useUsers({ role: 'driver', limit: 100 });

    const truckOptions = trucksQuery.data?.trucks?.map(t => ({ value: t._id, label: `${t.plateNumber} • ${t.brand}` })) || [];
    const trailerOptions = trailersQuery.data?.trailers?.map(t => ({ value: t._id, label: `${t.plateNumber} • ${t.type}` })) || [];
    const driverOptions = usersQuery.data?.users?.map(d => ({ value: d._id, label: `${d.fullname}` })) || [];

    useEffect(() => {
        if (isOpen) {
            if (tripToEdit) {
                // UPDATE / VIEW MODE
                reset({
                    ...tripToEdit,
                    truck: tripToEdit.truck?._id || tripToEdit.truck,
                    trailer: tripToEdit.trailer?._id || tripToEdit.trailer,
                    driver: tripToEdit.driver?._id || tripToEdit.driver,
                    startDate: tripToEdit.startDate?.split('T')[0],
                    endDate: tripToEdit.endDate?.split('T')[0],
                    // Convert nulls/strings to undefined if empty to avoid yup type errors
                    actualEndDate: tripToEdit.actualEndDate ? tripToEdit.actualEndDate.split('T')[0] : undefined,
                    fuelStart: tripToEdit.fuelStart ?? undefined,
                    fuelEnd: tripToEdit.fuelEnd ?? undefined,
                    kmEnd: tripToEdit.kmEnd ?? undefined,
                });
            } else {
                // CREATE MODE
                reset(defaultValues);
            }
        }
    }, [isOpen, tripToEdit, reset]);

    const onSubmit = async (data) => {
        try {
            // Clean payload
            const payload = { ...data };

            // Remove empty optional numbers
            if (!payload.plannedFuel) payload.plannedFuel = null;
            if (!payload.cargoWeight) payload.cargoWeight = null;

            // CRITICAL: If we are creating/updating a 'to-do' trip, 
            // completely strip these fields so the backend validation doesn't complain
            if (payload.status === 'to-do') {
                delete payload.fuelStart;
                delete payload.fuelEnd;
                delete payload.kmEnd;
                delete payload.actualEndDate;
                delete payload.notes;
                delete payload.kmStart;
            }

            if (tripToEdit) {
                await onUpdate({ id: tripToEdit._id, data: payload });
                toast.success("Trip updated");
            } else {
                await onCreate(payload);
                toast.success("Trip created");
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error saving trip");
        }
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-muted-foreground mt-2">
            <Icon size={16} /> <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
    );

    if (!isOpen) return null;

    const status = tripToEdit?.status || 'to-do';
    // Read-only if we are VIEWING a past trip (not to-do)
    const isReadOnly = status !== 'to-do';
    const hasStarted = status === 'in-progress' || status === 'completed';

    const selectStyles = {
        control: (state) => `!bg-background !border-border !rounded-lg shadow-sm !min-h-[38px] ${state.isFocused ? '!ring-2 !ring-primary/50 !border-primary' : ''}`,
        input: () => "!text-text",
        singleValue: () => "!text-text",
        menu: () => "!bg-background border border-border mt-1 rounded-md shadow-lg z-50",
        option: (state) => state.isSelected ? "!bg-primary !text-white" : state.isFocused ? "!bg-surface !text-text cursor-pointer" : "!bg-background !text-text",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col border border-border">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-text shrink-0">
                    <div>
                        <h3 className="text-lg font-bold">{tripToEdit ? (isReadOnly ? 'Trip Details' : 'Edit Trip') : 'Plan New Trip'}</h3>
                        {tripToEdit && <p className="text-xs opacity-75 font-mono">{tripToEdit.serialNumber}</p>}
                    </div>
                    <button onClick={onClose} type="button" className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 scrollbar-thin">

                    {/* View Only Banner */}
                    {isReadOnly && (
                        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-text">
                            <Info className="text-blue-500 shrink-0" size={20} />
                            <div>
                                <p className="font-bold text-sm">View Only Mode</p>
                                <p className="text-xs opacity-80 mt-1">This trip is <strong>{status}</strong>. You cannot edit planned details anymore.</p>
                            </div>
                        </div>
                    )}

                    <form id="trip-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* 1. EXECUTION METRICS - DISPLAY ONLY (No Inputs) */}
                        {/* We do NOT register these with React Hook Form to avoid validation errors on submission */}
                        {hasStarted && (
                            <div>
                                <SectionHeader icon={Activity} title="Execution Metrics" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground">Start KM</label><div className="text-sm border border-border rounded px-3 py-2 bg-black/5">{tripToEdit.kmStart?.toLocaleString() || '-'}</div></div>
                                    <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground">Start Fuel</label><div className="text-sm border border-border rounded px-3 py-2 bg-black/5">{tripToEdit.fuelStart ? `${tripToEdit.fuelStart} L` : '-'}</div></div>
                                    <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground">End KM</label><div className="text-sm border border-border rounded px-3 py-2 bg-black/5">{tripToEdit.kmEnd?.toLocaleString() || '-'}</div></div>
                                    <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground">End Fuel</label><div className="text-sm border border-border rounded px-3 py-2 bg-black/5">{tripToEdit.fuelEnd ? `${tripToEdit.fuelEnd} L` : '-'}</div></div>
                                </div>
                            </div>
                        )}

                        {/* 2. RESOURCES */}
                        <div className="bg-surface">
                            <SectionHeader icon={Truck} title="Resources" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Truck</label><Controller name="truck" control={control} render={({ field }) => (<Select {...field} isDisabled={isReadOnly} classNames={selectStyles} options={truckOptions} placeholder="Select..." value={truckOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} />)} /><p className="text-red-500 text-[10px] ml-1">{errors.truck?.message}</p></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Trailer</label><Controller name="trailer" control={control} render={({ field }) => (<Select {...field} isDisabled={isReadOnly} classNames={selectStyles} options={trailerOptions} placeholder="Select..." value={trailerOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} />)} /><p className="text-red-500 text-[10px] ml-1">{errors.trailer?.message}</p></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Driver</label><Controller name="driver" control={control} render={({ field }) => (<Select {...field} isDisabled={isReadOnly} classNames={selectStyles} options={driverOptions} placeholder="Select..." value={driverOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} />)} /><p className="text-red-500 text-[10px] ml-1">{errors.driver?.message}</p></div>
                            </div>
                        </div>

                        {/* 3. ROUTE & SCHEDULE */}
                        <div>
                            <SectionHeader icon={MapPin} title="Route & Schedule" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Start Location</label><input disabled={isReadOnly} {...register("startLocation")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /><p className="text-red-500 text-[10px] ml-1">{errors.startLocation?.message}</p></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">End Location</label><input disabled={isReadOnly} {...register("endLocation")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /><p className="text-red-500 text-[10px] ml-1">{errors.endLocation?.message}</p></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Start Date</label><input disabled={isReadOnly} type="date" {...register("startDate")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /><p className="text-red-500 text-[10px] ml-1">{errors.startDate?.message}</p></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">End Date (Planned)</label><input disabled={isReadOnly} type="date" {...register("endDate")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /><p className="text-red-500 text-[10px] ml-1">{errors.endDate?.message}</p></div>
                            </div>
                        </div>

                        {/* 4. DETAILS */}
                        <div>
                            <SectionHeader icon={Box} title="Details" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Type</label><select disabled={isReadOnly} {...register("type")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none"><option value="delivery">Delivery</option><option value="pickup">Pickup</option><option value="transfer">Transfer</option><option value="other">Other</option></select></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Planned Fuel (L)</label><input disabled={isReadOnly} type="number" {...register("plannedFuel")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /></div>
                                <div className="space-y-1"><label className="text-xs font-semibold ml-1">Weight (kg)</label><input disabled={isReadOnly} type="number" {...register("cargoWeight")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs font-semibold ml-1">Description</label><textarea disabled={isReadOnly} {...register("description")} rows="2" className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Add notes..."></textarea></div>

                            {/* Trip Notes (Displayed statically if exist) */}
                            {tripToEdit?.notes && (
                                <div className="space-y-1 mt-4"><label className="text-xs font-semibold ml-1">Completion Notes</label><div className="w-full px-3 py-2 rounded-lg border border-border bg-black/5 text-sm">{tripToEdit.notes}</div></div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">Close</button>
                            {!isReadOnly && (
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary shadow-sm hover:opacity-90 disabled:opacity-50 transition-all">
                                    {isSubmitting ? 'Saving...' : 'Save Trip'}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Fuel Logs Manager */}
                    {hasStarted && tripToEdit && (
                        <div className="mt-6 border-t border-border pt-6">
                            <FuelLogManager tripId={tripToEdit._id} isReadOnly={status === 'completed'} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}