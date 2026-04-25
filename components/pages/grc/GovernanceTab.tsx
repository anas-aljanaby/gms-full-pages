import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Policy, Decision, PolicyStatus, DecisionStatus } from '../../../types';
import { formatDate } from '../../../lib/utils';
import AiCard from '../ai/AiCard';
import { PlusCircle, X as XIcon } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface GovernanceTabProps {
    policies: Policy[];
    decisions: Decision[];
}

const NewPolicyModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("New policy data submitted.");
        toast.showSuccess("New policy has been logged for creation.");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('grc.governance.newPolicy')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.policyTitle')}</label>
                            <input type="text" required className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.category')}</label>
                                <input type="text" className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.version')}</label>
                                <input type="text" placeholder="e.g., 1.0" className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Effective Date</label>
                                <input type="date" className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.reviewDate')}</label>
                                <input type="date" className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

const NewDecisionModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("New decision data submitted.");
        toast.showSuccess("New decision has been logged for creation.");
        onClose();
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('grc.governance.newDecision')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.decisionTitle')}</label>
                            <input type="text" required className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('grc.governance.table.date')}</label>
                                <input type="date" className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Impact</label>
                                <select className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const GovernanceTab: React.FC<GovernanceTabProps> = ({ policies, decisions }) => {
    const { t, language } = useLocalization();
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

    const PolicyStatusBadge: React.FC<{status: PolicyStatus}> = ({ status }) => {
        const styles: Record<PolicyStatus, string> = {
            'draft': 'bg-gray-100 text-gray-800',
            'active': 'bg-green-100 text-green-800',
            'archived': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`grc.governance.statuses.${status}`)}</span>;
    };
    
     const DecisionStatusBadge: React.FC<{status: DecisionStatus}> = ({ status }) => {
        const styles: Record<DecisionStatus, string> = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'implemented': 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`grc.governance.decision_statuses.${status}`)}</span>;
    };


    return (
        <>
            <div className="space-y-6">
                <AiCard title={t('grc.governance.policies')}>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsPolicyModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                            <PlusCircle size={16}/> {t('grc.governance.newPolicy')}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-2">{t('grc.governance.table.policyTitle')}</th>
                                    <th className="p-2">{t('grc.governance.table.category')}</th>
                                    <th className="p-2">{t('grc.governance.table.version')}</th>
                                    <th className="p-2">{t('grc.governance.table.status')}</th>
                                    <th className="p-2">{t('grc.governance.table.reviewDate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map(p => (
                                    <tr key={p.id} className="border-t dark:border-slate-700">
                                        <td className="p-2 font-semibold text-foreground dark:text-dark-foreground">{p.title[language]}</td>
                                        <td className="p-2 text-foreground dark:text-dark-foreground">{p.category}</td>
                                        <td className="p-2 text-foreground dark:text-dark-foreground">{p.version}</td>
                                        <td className="p-2"><PolicyStatusBadge status={p.status} /></td>
                                        <td className="p-2 text-foreground dark:text-dark-foreground">{formatDate(p.reviewDate, language)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AiCard>
                <AiCard title={t('grc.governance.decisions')}>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsDecisionModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                            <PlusCircle size={16}/> {t('grc.governance.newDecision')}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-2">{t('grc.governance.table.decisionTitle')}</th>
                                    <th className="p-2">{t('grc.governance.table.date')}</th>
                                    <th className="p-2">{t('grc.governance.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {decisions.map(d => (
                                    <tr key={d.id} className="border-t dark:border-slate-700">
                                        <td className="p-2 font-semibold text-foreground dark:text-dark-foreground">{d.title[language]}</td>
                                        <td className="p-2 text-foreground dark:text-dark-foreground">{formatDate(d.date, language)}</td>
                                        <td className="p-2"><DecisionStatusBadge status={d.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AiCard>
            </div>
            <NewPolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
            <NewDecisionModal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} />
        </>
    );
};

export default GovernanceTab;
