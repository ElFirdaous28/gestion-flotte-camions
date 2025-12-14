import { useState } from 'react';
import { useTrailers } from '../../hooks/useTrailers';
import TrailerModal from '../../components/modals/TrailerModal';
import { SquarePen, Trash2 } from 'lucide-react';

export default function Trailers() {
    const [page, setPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedTrailer, setSelectedTrailer] = useState(null);

    const { trailersQuery, deleteTrailer, createTrailer, updateTrailer } = useTrailers({ page });

    const trailers = trailersQuery.data || [];
    const isLoading = trailersQuery.isLoading;

    const openModal = (trailer = null) => {
        setSelectedTrailer(trailer);
        setModalOpen(true);
    };

    const handleSaveTrailer = async (data) => {
        if (selectedTrailer) {
            await updateTrailer.mutateAsync({ id: selectedTrailer._id, data });
        } else {
            await createTrailer.mutateAsync(data);
        }
    };

    return (
        <div className="w-[90%] max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text">Trailers</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-text rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                    + Add Trailer
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full">
                    <thead className="bg-primary text-text">
                        <tr>
                            <th className="px-4 py-3 text-left">Plate</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Max Load (kg)</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                        ) : (
                            trailers.map((trailer) => (
                                <tr key={trailer._id} className="border-t border-border">
                                    <td className="px-4 py-3 font-medium">{trailer.plateNumber}</td>
                                    <td className="px-4 py-3 capitalize">{trailer.type}</td>
                                    <td className="px-4 py-3">{trailer.maxLoad}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize bg-surface border border-primary ${trailer.status === 'available'
                                                ? 'text-green-600'
                                                : trailer.status === 'unavailable'
                                                    ? 'text-gray-600'
                                                    : trailer.status === 'on_trip'
                                                        ? 'text-blue-600'
                                                        : trailer.status === 'maintenance'
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-800'
                                                }`}
                                        >
                                            {trailer.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-3">
                                        <button onClick={() => openModal(trailer)} className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background" title="Edit Trailer">
                                            <SquarePen size={18} />
                                        </button>
                                        <button onClick={() => deleteTrailer.mutate(trailer._id)} className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background" title="Delete Trailer">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveTrailer}
                trailerToEdit={selectedTrailer}
            />
        </div>
    );
}