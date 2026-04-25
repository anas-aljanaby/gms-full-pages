
import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { Loan, LoanType } from '../../../types';
import { MOCK_INDIVIDUAL_DONORS } from '../../../data/individualDonorsData';
import { MOCK_STAKEHOLDERS } from '../../../data/stakeholderData';
import { MOCK_PROJECTS } from '../../../data/projectData';

interface AddLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (loanData: Omit<Loan, 'id' | 'repaymentSchedule' | 'status'> & { term: number }) => void;
}

const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { t, language } = useLocalization();
    const [borrowerName, setBorrowerName] = useState('');
    const [type, setType] = useState<LoanType>('educational');
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState<'USD' | 'TRY' | 'SAR'>('USD');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [term, setTerm] = useState(12); // months
    const [donorId, setDonorId] = useState('');
    const [stakeholderId, setStakeholderId] = useState<number | ''>('');
    const [projectId, setProjectId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!borrowerName || amount <= 0 || term <= 0) {
            alert('Please fill all fields correctly.');
            return;
        }
        onAdd({
            borrowerName,
            type,
            amount,
            currency,
            issueDate,
            term,
            donorId: donorId || undefined,
            stakeholderId: stakeholderId ? Number(stakeholderId) : undefined,
            projectId: projectId || undefined,
        });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('loans.addModal.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.loanType')}</label>
                                <select value={type} onChange={e => setType(e.target.value as LoanType)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="educational">{t('loans.loanTypes.educational')}</option>
                                    <option value="operational">{t('loans.loanTypes.operational')}</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.borrowerName')}</label>
                                <input type="text" value={borrowerName} onChange={e => setBorrowerName(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.amount')}</label>
                                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required min="1" className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.currency')}</label>
                                <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="USD">USD</option>
                                    <option value="TRY">TRY</option>
                                    <option value="SAR">SAR</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.issueDate')}</label>
                                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.term')}</label>
                                <input type="number" value={term} onChange={e => setTerm(Number(e.target.value))} required min="1" className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                            </div>
                        </div>
                        <div className="pt-4 border-t dark:border-slate-700 space-y-4">
                             <h3 className="font-semibold text-lg">{t('loans.integrations.title')}</h3>
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.fundingSource')}</label>
                                <select value={donorId} onChange={e => setDonorId(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="">-- Select Donor --</option>
                                    {MOCK_INDIVIDUAL_DONORS.map(d => <option key={d.id} value={d.id}>{d.fullName[language] || d.fullName.en}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.borrowerRecord')}</label>
                                <select value={stakeholderId} onChange={e => setStakeholderId(Number(e.target.value))} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="">-- Select Stakeholder --</option>
                                    {MOCK_STAKEHOLDERS.map(s => <option key={s.id} value={s.id}>{s.name[language] || s.name.en}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('loans.addModal.projectTag')}</label>
                                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="">-- Select Project --</option>
                                    {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name[language] || p.name.en}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('loans.addModal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary-dark">{t('loans.addModal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoanModal;
