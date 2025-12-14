import { useState } from 'react';
import { useMaintenanceRules } from '../../hooks/useMaintenanceRules';
import MaintenanceRuleModal from '../../components/modals/MaintenanceRuleModal';
import { SquarePen, Trash2 } from 'lucide-react';

export default function MaintenanceRules() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);

    const { rulesQuery, deleteRule, createRule, updateRule } = useMaintenanceRules();

    const rules = rulesQuery.data || [];
    const isLoading = rulesQuery.isLoading;

    const openModal = (rule = null) => {
        setSelectedRule(rule);
        setModalOpen(true);
    };

    const handleSaveRule = async (data) => {
        if (selectedRule) {
            await updateRule.mutateAsync({ id: selectedRule._id, data });
        } else {
            await createRule.mutateAsync(data);
        }
    };

    return (
        <div className="w-[90%] max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text">Maintenance Rules</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-text rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                    + Add Rule
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full">
                    <thead className="bg-primary text-text">
                        <tr>
                            <th className="px-4 py-3 text-left">Target Vehicle</th>
                            <th className="px-4 py-3 text-left">Trigger Interval</th>
                            <th className="px-4 py-3 text-left">Description</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                        ) : (
                            rules.map((rule) => (
                                <tr key={rule._id} className="border-t border-border">
                                    <td className="px-4 py-3 capitalize font-medium">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rule.target === 'truck' ? 'bg-blue-100 text-blue-700' :
                                                rule.target === 'trailer' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-purple-100 text-purple-700'
                                            }`}>
                                            {rule.target}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        Every <span className="font-bold">{rule.intervalValue}</span> {rule.intervalType}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-muted capitalize">
                                        {rule.description || '-'}
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-3">
                                        <button onClick={() => openModal(rule)} className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background" title="Edit Rule">
                                            <SquarePen size={18} />
                                        </button>
                                        <button onClick={() => deleteRule.mutate(rule._id)} className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background" title="Delete Rule">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!isLoading && rules.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No maintenance rules found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <MaintenanceRuleModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveRule}
                ruleToEdit={selectedRule}
            />
        </div>
    );
}