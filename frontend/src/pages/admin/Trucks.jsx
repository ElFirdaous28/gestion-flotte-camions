import { useState } from 'react';
import { useTrucks } from '../../hooks/useTrucks';
import TruckModal from '../../components/modals/TruckModal';
import { SquarePen, Trash2 } from 'lucide-react';

export default function Trucks() {
    const [page, setPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState(null);

    const { trucksQuery, deleteTruck, createTruck, updateTruck } = useTrucks({ page });

    const trucks = trucksQuery.data || [];
    const isLoading = trucksQuery.isLoading;

    const openModal = (truck = null) => {
        setSelectedTruck(truck);
        setModalOpen(true);
    };

    const handleSaveTruck = async (data) => {
        if (selectedTruck) {
            await updateTruck.mutateAsync({ id: selectedTruck._id, data });
        } else {
            await createTruck.mutateAsync(data);
        }
    };

    return (
        <div className="w-[90%] max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text">Trucks</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-text rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                    + Add Truck
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full">
                    <thead className="bg-primary text-text">
                        <tr>
                            <th className="px-4 py-3 text-left">Plate</th>
                            <th className="px-4 py-3 text-left">Brand</th>
                            <th className="px-4 py-3 text-left">Model</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                        ) : (
                            trucks.map((truck) => (
                                <tr key={truck._id} className="border-t border-border">
                                    <td className="px-4 py-3 font-medium">{truck.plateNumber}</td>
                                    <td className="px-4 py-3">{truck.brand}</td>
                                    <td className="px-4 py-3">{truck.model}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize bg-surface border border-primary ${truck.status === 'available'
                                                ? 'text-green-600'
                                                : truck.status === 'unavailable'
                                                    ? 'text-gray-600'
                                                    : truck.status === 'on_trip'
                                                        ? 'text-blue-600'
                                                        : truck.status === 'maintenance'
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-800'
                                                }`
                                            }
                                        >
                                            {truck.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-3">
                                        <button onClick={() => openModal(truck)} className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background" title="Edit Truck">
                                            <SquarePen size={18} />
                                        </button>
                                        <button onClick={() => deleteTruck.mutate(truck._id)} className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background" title="Delete Truck">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TruckModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveTruck}
                truckToEdit={selectedTruck}
            />
        </div>
    );
}