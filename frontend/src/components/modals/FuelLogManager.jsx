import { useState } from 'react';
import { useForm } from "react-hook-form";
import { useFuelEntries } from "../../hooks/useFuelEntries";
import { Fuel, Trash2, Plus, FileText, Loader2, UploadCloud, Save, X, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

export default function FuelLogManager({ tripId, isReadOnly }) {
    const [editingId, setEditingId] = useState(null); // Track which row is being edited
    const [isAdding, setIsAdding] = useState(false);

    const { fuelEntriesQuery, createFuelEntry, deleteFuelEntry, updateFuelEntry } = useFuelEntries(tripId);
    const entries = fuelEntriesQuery.data || [];

    // --- FORM COMPONENT FOR ADD/EDIT ---
    const FuelForm = ({ defaultValues, onSave, onCancel, isLoading }) => {
        const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

        const onSubmit = (data) => {
            const formData = new FormData();
            formData.append('trip', tripId);
            formData.append('amount', data.amount);
            formData.append('invoiceSerial', data.invoiceSerial);
            if (data.invoiceFile && data.invoiceFile[0]) {
                formData.append('invoiceFile', data.invoiceFile[0]);
            }
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-lg p-3 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Amount (L)</label>
                        <input {...register("amount", { required: "Required", min: 1 })} type="number" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary" placeholder="0" />
                        {errors.amount && <p className="text-red-500 text-[10px]">{errors.amount.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Invoice #</label>
                        <input {...register("invoiceSerial", { required: "Required" })} type="text" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary" placeholder="INV-..." />
                        {errors.invoiceSerial && <p className="text-red-500 text-[10px]">{errors.invoiceSerial.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Invoice Image</label>
                    <input {...register("invoiceFile")} type="file" accept="image/*,.pdf" className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={onCancel} className="px-3 py-1 text-xs rounded border border-border hover:bg-black/5">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-3 py-1 text-xs rounded bg-primary text-text font-medium flex items-center gap-1">
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                    </button>
                </div>
            </form>
        );
    };

    // --- HANDLERS ---
    const handleCreate = async (formData) => {
        try {
            await createFuelEntry.mutateAsync(formData);
            toast.success("Added");
            setIsAdding(false);
        } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateFuelEntry.mutateAsync({ id: editingId, formData });
            toast.success("Updated");
            setEditingId(null);
        } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    };

    return (
        <div className="mt-6 border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Fuel size={14} /> Fuel Logs
                </h4>
                {!isReadOnly && !isAdding && (
                    <button type="button" onClick={() => setIsAdding(true)} className="text-xs flex items-center gap-1 text-primary hover:underline font-medium">
                        <Plus size={14} /> Add Entry
                    </button>
                )}
            </div>

            {/* CREATE FORM */}
            {isAdding && (
                <div className="mb-3">
                    <FuelForm
                        defaultValues={{ amount: '', invoiceSerial: '' }}
                        onSave={handleCreate}
                        onCancel={() => setIsAdding(false)}
                        isLoading={createFuelEntry.isPending}
                    />
                </div>
            )}

            {/* LIST */}
            <div className="space-y-2">
                {fuelEntriesQuery.isLoading ? (
                    <p className="text-xs text-center py-2">Loading...</p>
                ) : entries.length === 0 && !isAdding ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2 bg-black/5 rounded">No fuel entries recorded.</p>
                ) : (
                    entries.map(entry => (
                        <div key={entry._id}>
                            {editingId === entry._id ? (
                                // EDIT FORM
                                <FuelForm
                                    defaultValues={{ amount: entry.amount, invoiceSerial: entry.invoiceSerial }}
                                    onSave={handleUpdate}
                                    onCancel={() => setEditingId(null)}
                                    isLoading={updateFuelEntry.isPending}
                                />
                            ) : (
                                // DISPLAY ROW
                                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                            <Fuel size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{entry.amount} Liters</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="font-mono">#{entry.invoiceSerial}</span>
                                                <span className="opacity-50">•</span>
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {entry.invoiceFile && (
                                            <a href={`http://localhost:5000/${entry.invoiceFile}`} target="_blank" rel="noreferrer" className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded" title="Invoice">
                                                <FileText size={14} />
                                            </a>
                                        )}
                                        {!isReadOnly && (
                                            <>
                                                <button onClick={() => setEditingId(entry._id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => { if (confirm('Delete?')) deleteFuelEntry.mutate(entry._id) }} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}