import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X, AlertCircle } from 'lucide-react';
import { CompleteTripSchema } from "../../validation/tripSchema";
import FuelLogManager from "./FuelLogManager";

export default function CompleteTripModal({ isOpen, onClose, trip, onComplete }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: yupResolver(CompleteTripSchema),
        defaultValues: { actualEndDate: new Date().toISOString().split('T')[0] }
    });

    const onSubmit = async (data) => {
        try {
            await onComplete({
                id: trip._id,
                data: {
                    fuelEnd: Number(data.fuelEnd),
                    kmEnd: Number(data.kmEnd),
                    notes: data.notes,
                    actualEndDate: data.actualEndDate
                }
            });
            toast.success("Trip completed successfully");
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to complete trip");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-lg font-bold">Complete Trip</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full"><X size={20} /></button>
                </div>

                {/* Body (Scrollable) */}
                <div className="overflow-y-auto flex-1 p-6 scrollbar-thin">

                    {/* Status Alert */}
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex gap-3">
                        <AlertCircle className="text-emerald-600 shrink-0" />
                        <div className="text-sm text-emerald-900/80">
                            <p className="font-bold text-emerald-700">Trip Completed</p>
                            <p>Enter final readings to release truck <strong>{trip?.truck?.plateNumber}</strong>.</p>
                        </div>
                    </div>

                    {/* Main Completion Form */}
                    <form id="complete-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold ml-1">End Odometer (KM)</label>
                                <input type="number" {...register("kmEnd")} className="w-full px-3 py-3 rounded-lg border border-border bg-surface text-lg font-mono outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                <p className="text-red-500 text-[10px] ml-1">{errors.kmEnd?.message}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold ml-1">End Fuel (L)</label>
                                <input type="number" {...register("fuelEnd")} className="w-full px-3 py-3 rounded-lg border border-border bg-surface text-lg font-mono outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                <p className="text-red-500 text-[10px] ml-1">{errors.fuelEnd?.message}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold ml-1">Actual End Date</label>
                            <input type="date" {...register("actualEndDate")} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                            <p className="text-red-500 text-[10px] ml-1">{errors.actualEndDate?.message}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold ml-1">Notes / Issues</label>
                            <textarea {...register("notes")} rows="3" className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Optional notes..."></textarea>
                        </div>
                    </form>

                    {/* FUEL LOG MANAGER 
                       Pass isReadOnly={false} because user might need to add logs before completing 
                    */}
                    <div className="mt-4">
                        <FuelLogManager tripId={trip._id} isReadOnly={false} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-border bg-surface/50 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-text hover:bg-black/5">Cancel</button>
                    <button type="submit" form="complete-form" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 shadow-sm hover:opacity-90 disabled:opacity-50">
                        {isSubmitting ? 'Processing...' : 'Complete Trip'}
                    </button>
                </div>
            </div>
        </div>
    );
}