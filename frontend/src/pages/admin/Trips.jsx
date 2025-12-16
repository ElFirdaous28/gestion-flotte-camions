import { useState } from 'react';
import { useTrips } from '../../hooks/useTrips';
import TripFormModal from '../../components/modals/TripFormModal';
import StartTripModal from '../../components/modals/StartTripModal';
import { SquarePen, Trash2, Play, CheckCircle, Eye, Calendar, Search, Plus, Truck, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import CompleteTripModal from '../../components/modals/CompleteTripModal.';

export default function Trips() {
    // --- Filters ---
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');

    // --- Modal States ---
    const [activeModal, setActiveModal] = useState(null); // 'form' | 'start' | 'complete' | null
    const [selectedTrip, setSelectedTrip] = useState(null);

    const { tripsQuery, deleteTrip, createTrip, updateTrip, startTrip, completeTrip } = useTrips({ page, search, status, type });
    const trips = tripsQuery.data?.trips || [];
    const pagination = tripsQuery.data?.pagination || { totalPages: 1, total: 0 };
    const isLoading = tripsQuery.isLoading;

    const handleFilterChange = (setter, value) => { setter(value); setPage(1); };

    // --- Action Handlers ---
    const openFormModal = (trip = null) => {
        setSelectedTrip(trip);
        setActiveModal('form');
    };

    const openStartModal = (trip) => {
        setSelectedTrip(trip);
        setActiveModal('start');
    };

    const openCompleteModal = (trip) => {
        setSelectedTrip(trip);
        setActiveModal('complete');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedTrip(null);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text tracking-tight">Trip Management</h2>
                    <p className="text-text-muted text-sm mt-1">Schedule and monitor fleet movements.</p>
                </div>
                <button onClick={() => openFormModal(null)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text font-medium rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all">
                    <Plus size={20} /> <span>Plan Trip</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => handleFilterChange(setSearch, e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="relative">
                    <select value={status} onChange={(e) => handleFilterChange(setStatus, e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                        <option value="">All Statuses</option>
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <select value={type} onChange={(e) => handleFilterChange(setType, e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                        <option value="">All Types</option>
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                        <option value="transfer">Transfer</option>
                        <option value="other">Other</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary text-text border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-24">ID</th>
                                <th className="px-6 py-4 font-semibold">Route & Date</th>
                                <th className="px-6 py-4 font-semibold">Resources</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-text-muted">Loading...</td></tr>
                            ) : trips.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-text-muted">No trips found.</td></tr>
                            ) : (
                                trips.map((trip) => (
                                    <tr key={trip._id} className="hover:bg-black/2 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{trip.serialNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-medium text-text">
                                                    <span className="truncate max-w-[100px]">{trip.startLocation}</span><span className="text-text-muted">→</span><span className="truncate max-w-[100px]">{trip.endLocation}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-text-muted"><Calendar size={12} /><span>{new Date(trip.startDate).toLocaleDateString()}</span></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-medium"><Truck size={14} className="text-primary" /><span>{trip.truck?.plateNumber || 'No Truck'}</span></div>
                                                <div className="text-xs text-text-muted pl-5">{trip.driver?.fullname || 'No Driver'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{(trip.type)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(trip.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-1 transition-opacity">
                                                <button onClick={() => openFormModal(trip)}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    title={trip.status === 'to-do' ? "Edit" : "View"}>
                                                    {trip.status === 'to-do' ? <SquarePen size={16} /> : <Eye size={16} />}
                                                </button>
                                                {trip.status === 'to-do' && (
                                                    <button onClick={() => openStartModal(trip)}
                                                        className="p-2 text-text-muted hover:text-green-600 hover:bg-green-500/10 rounded-md transition-colors"
                                                        title="Start">
                                                        <Play size={16} />
                                                    </button>
                                                )}
                                                {trip.status === 'in-progress' && (
                                                    <button onClick={() => openCompleteModal(trip)}
                                                        className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors"
                                                        title="Complete">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteTrip.mutate(trip._id)}
                                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="Delete">
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
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
                    <span className="text-xs text-text-muted">Showing {trips.length} of {pagination.total} records</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(old => Math.max(old - 1, 1))} disabled={page === 1} className="p-1.5 rounded-md border border-border hover:bg-black/5 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <span className="text-sm font-medium px-2">Page {page} of {pagination.totalPages}</span>
                        <button onClick={() => setPage(old => (pagination.totalPages > old ? old + 1 : old))} disabled={page >= pagination.totalPages} className="p-1.5 rounded-md border border-border hover:bg-black/5 disabled:opacity-50"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <TripFormModal
                isOpen={activeModal === 'form'}
                onClose={closeModal}
                tripToEdit={selectedTrip}
                // Pass create/update mutations directly
                onCreate={createTrip.mutateAsync}
                onUpdate={updateTrip.mutateAsync} />

            <StartTripModal
                isOpen={activeModal === 'start'}
                onClose={closeModal}
                trip={selectedTrip}
                onStart={startTrip.mutateAsync} />

            <CompleteTripModal
                isOpen={activeModal === 'complete'}
                onClose={closeModal}
                trip={selectedTrip}
                onComplete={completeTrip.mutateAsync} />
        </div>
    );
}