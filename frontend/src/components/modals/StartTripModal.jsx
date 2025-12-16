import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { X, AlertCircle } from 'lucide-react';
import { StartTripSchema } from "../../validation/tripSchema";

export default function StartTripModal({ isOpen, onClose, trip, onStart }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: yupResolver(StartTripSchema),
    });

    const onSubmit = async (data) => {
        try {
            await onStart({ id: trip._id, fuelStart: Number(data.fuelStart) });
            toast.success("Trip started successfully");
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to start trip");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-surface w-full max-w-md min-w-1/3 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border">
                <div className="bg-amber-500 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-lg font-bold">Start Trip</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" />
                        <div className="text-sm text-amber-900/80">
                            <p className="font-bold text-amber-700">Confirm Start</p>
                            <p>Trip <strong>{trip?.serialNumber}</strong> will move to <strong>In-Progress</strong>.</p>
                        </div>
                    </div>

                    <form id="start-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-center">Starting Fuel Level</label>
                            <div className="relative max-w-[200px] mx-auto">
                                <input type="number" {...register("fuelStart")} className="w-full px-4 py-3 text-2xl text-center font-mono rounded-xl border border-border bg-surface outline-none focus:ring-4 focus:ring-amber-500/20" placeholder="000" autoFocus />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">L</span>
                            </div>
                            <p className="text-red-500 text-xs text-center">{errors.fuelStart?.message}</p>
                        </div>
                    </form>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border bg-surface/50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-text hover:bg-black/5">Cancel</button>
                    <button type="submit" form="start-form" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-amber-500 shadow-sm hover:opacity-90 disabled:opacity-50">
                        {isSubmitting ? 'Starting...' : 'Confirm Start'}
                    </button>
                </div>
            </div>
        </div>
    );
}