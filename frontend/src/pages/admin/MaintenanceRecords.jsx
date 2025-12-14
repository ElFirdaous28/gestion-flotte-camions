import { useState } from 'react';
import { useMaintenanceRecords } from '../../hooks/useMaintenanceRecords';
import MaintenanceRecordModal from '../../components/modals/MaintenanceRecordModal';
import { SquarePen, Trash2, Calendar, Gauge } from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceRecords() {
    const [page, setPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const { recordsQuery, deleteRecord, createRecord, updateRecord } = useMaintenanceRecords({ page });

    const data = recordsQuery.data || {};
    const records = data.records || [];
    const pagination = data.pagination || {};
    const isLoading = recordsQuery.isLoading;

    console.log(records[0]);
    

    const openModal = (record = null) => {
        setSelectedRecord(record);
        setModalOpen(true);
    };

    const handleSaveRecord = async (formData) => {
        if (selectedRecord) {
            await updateRecord.mutateAsync({ id: selectedRecord._id, data: formData });
        } else {
            await createRecord.mutateAsync(formData);
        }
    };

    return (
        <div className="w-[90%] max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text">Maintenance Records</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-text rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                    + Add Record
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full">
                    <thead className="bg-primary text-text">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Target</th>
                            <th className="px-4 py-3 text-left">Rule / Task</th>
                            <th className="px-4 py-3 text-left">KM</th>
                            <th className="px-4 py-3 text-left">Description</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                        ) : (
                            records.map((record) => (
                                <tr key={record._id} className="border-t border-border hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            <span>{format(new Date(record.performedAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold uppercase ${record.targetType === 'truck' ? 'text-blue-500' :
                                                    record.targetType === 'trailer' ? 'text-orange-500' :
                                                        'text-purple-500'
                                                }`}>
                                                {record.targetType}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]" title={record.targetId}>
                                                ID: {record.targetId}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium block capitalize">{record.rule?.description || '-'}</span>
                                        {record.rule && (
                                            <span className="text-xs text-muted-foreground">
                                                Every {record.rule.intervalValue} {record.rule.intervalType}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {record.kmAtMaintenance ? (
                                            <div className="flex items-center gap-1">
                                                <Gauge size={14} className="text-muted-foreground" />
                                                {record.kmAtMaintenance.toLocaleString()}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                        {record.description || '-'}
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-3">
                                        <button onClick={() => openModal(record)} className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background" title="Edit Record">
                                            <SquarePen size={18} />
                                        </button>
                                        <button onClick={() => deleteRecord.mutate(record._id)} className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background" title="Delete Record">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!isLoading && records.length === 0 && (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-end mt-4 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-text">Page {page} of {pagination.totalPages}</span>
                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <MaintenanceRecordModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveRecord}
                recordToEdit={selectedRecord}
            />
        </div>
    );
}