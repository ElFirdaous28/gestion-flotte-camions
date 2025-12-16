import { useState } from 'react';
import { useTrips } from '../../hooks/useTrips';
import TripModal from '../../components/modals/TripModal';
import { SquarePen, Trash2, Play, CheckCircle, Eye, Calendar, Search, Plus, Truck, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Trips() {
    // 1. Filter States
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ trip: null, action: 'create' });

    // 2. Pass filters to hook
    const { tripsQuery, deleteTrip, createTrip, updateTrip, startTrip, completeTrip } = useTrips({
        page,
        search,
        status,
        type
    });

    // 3. Handle data structure (Backend returns { trips, pagination })
    const trips = tripsQuery.data?.trips || [];
    const pagination = tripsQuery.data?.pagination || { totalPages: 1, page: 1, total: 0 };
    const isLoading = tripsQuery.isLoading;

    // Helper to reset page when filtering
    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(1); // Always go back to page 1 when filtering
    };

    const openModal = (trip, action) => {
        setModalData({ trip, action });
        setModalOpen(true);
    };

    const handleModalSubmit = async (data) => {
        const { trip, action } = modalData;
        if (action === 'create') await createTrip.mutateAsync(data);
        else if (action === 'update') await updateTrip.mutateAsync({ id: trip._id, data });
        else if (action === 'start') await startTrip.mutateAsync({ id: trip._id, fuelStart: Number(data.fuelStart) });
        else if (action === 'complete') await completeTrip.mutateAsync({
            id: trip._id,
            data: { ...data, fuelEnd: Number(data.fuelEnd), kmEnd: Number(data.kmEnd), actualEndDate: new Date() }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'to-do': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
            'in-progress': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
            'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
            'cancelled': 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {status.toUpperCase().replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="w-[95%] max-w-7xl mx-auto py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text tracking-tight">Trip Management</h2>
                    <p className="text-text-muted text-sm mt-1">Schedule and monitor fleet movements.</p>
                </div>

                <button
                    onClick={() => openModal(null, 'create')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text font-medium rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    <span>Plan Trip</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Search */}
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by driver, location..."
                        value={search}
                        onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={status}
                        onChange={(e) => handleFilterChange(setStatus, e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>

                {/* Type Filter */}
                <div className="relative">
                    <select
                        value={type}
                        onChange={(e) => handleFilterChange(setType, e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    >
                        <option value="">All Types</option>
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                        <option value="transfer">Transfer</option>
                        <option value="other">Other</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary/5 text-text border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-24">Number</th>
                                <th className="px-6 py-4 font-semibold">Route & Date</th>
                                <th className="px-6 py-4 font-semibold">Resources</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-text-muted">Loading trips...</td></tr>
                            ) : trips.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-text-muted">No trips found matching your filters.</td></tr>
                            ) : (
                                trips.map((trip) => (
                                    <tr key={trip._id} className="hover:bg-black/2 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{trip.serialNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-medium text-text">
                                                    <span className="truncate max-w-[100px]">{trip.startLocation}</span>
                                                    <span className="text-text-muted">→</span>
                                                    <span className="truncate max-w-[100px]">{trip.endLocation}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                    <Calendar size={12} />
                                                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Truck size={14} className="text-primary" />
                                                    <span>{trip.truck?.plateNumber || 'No Truck'}</span>
                                                </div>
                                                <div className="text-xs text-text-muted pl-5">
                                                    {trip.driver?.fullname || trip.driver?.username || 'No Driver'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(trip.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end items-center gap-1 sm:group-hover:opacity-100 transition-opacity">

                                                {/* Edit / View Button */}
                                                <button
                                                    onClick={() => openModal(trip, 'update')}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    title={trip.status === 'to-do' ? "Edit" : "View"}
                                                >
                                                    {trip.status === 'to-do' ? <SquarePen size={16} /> : <Eye size={16} />}
                                                </button>

                                                {/* Start Button (Green) */}
                                                {trip.status === 'to-do' && (
                                                    <button
                                                        onClick={() => openModal(trip, 'start')}
                                                        className="p-2 text-text-muted hover:text-green-600 hover:bg-green-500/10 rounded-md transition-colors"
                                                        title="Start"
                                                    >
                                                        <Play size={16} />
                                                    </button>
                                                )}

                                                {/* Complete Button (Blue) */}
                                                {trip.status === 'in-progress' && (
                                                    <button
                                                        onClick={() => openModal(trip, 'complete')}
                                                        className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors"
                                                        title="Complete"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}

                                                {/* Delete Button (Red) */}
                                                <button
                                                    onClick={() => deleteTrip.mutate(trip._id)}
                                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                        Showing {trips.length} of {pagination.total} records
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(old => Math.max(old - 1, 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-md border border-border hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium px-2">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(old => (pagination.totalPages > old ? old + 1 : old))}
                            disabled={page >= pagination.totalPages}
                            className="p-1.5 rounded-md border border-border hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <TripModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                tripToEdit={modalData.trip}
                action={modalData.action}
            />
        </div>
    );
}