import { useState } from 'react';
import { useTires } from '../../hooks/useTires';
import TireModal from '../../components/modals/TireModal';
import { SquarePen, Trash2 } from 'lucide-react';

export default function Tires() {
    const [page, setPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedTire, setSelectedTire] = useState(null);


    const { tiresQuery, deleteTire, createTire, updateTire } = useTires({ page });

    const tires = tiresQuery.data || [];
    const isLoading = tiresQuery.isLoading;

    const openModal = (tire = null) => {
        setSelectedTire(tire);
        setModalOpen(true);
    };

    const handleSaveTire = async (data) => {
        const payload = { ...data };
        if (!payload.truck) delete payload.truck;
        if (!payload.trailer) delete payload.trailer;

        if (selectedTire) {
            await updateTire.mutateAsync({ id: selectedTire._id, data: payload });
        } else {
            await createTire.mutateAsync(payload);
        }
    };

    return (
        <div className="w-[90%] max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text">Tires</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-text rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                    + Add Tire
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full">
                    <thead className="bg-primary text-text">
                        <tr>
                            <th className="px-4 py-3 text-left">Brand / Model</th>
                            <th className="px-4 py-3 text-left">Size</th>
                            <th className="px-4 py-3 text-left">Position</th>
                            <th className="px-4 py-3 text-left">Assignment</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                        ) : (
                            tires.map((tire) => (
                                <tr key={tire._id} className="border-t border-border">
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex flex-col">
                                            <span>{tire.brand}</span>
                                            <span className="text-xs text-muted-foreground">{tire.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{tire.size}</td>
                                    <td className="px-4 py-3 capitalize">{tire.position || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {tire.truck ? (
                                            <span className="text-blue-600 font-medium">
                                                Truck: {tire.truck.plateNumber} | {tire.truck.brand} {tire.truck.model}
                                            </span>
                                        ) : tire.trailer ? (
                                            <span className="text-orange-600 font-medium">
                                                Trailer: {tire.trailer.plateNumber} | {tire.trailer.type}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-3">
                                        <button onClick={() => openModal(tire)} className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background" title="Edit Tire">
                                            <SquarePen size={18} />
                                        </button>
                                        <button onClick={() => deleteTire.mutate(tire._id)} className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background" title="Delete Tire">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TireModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveTire}
                tireToEdit={selectedTire}
            />
        </div>
    );
}