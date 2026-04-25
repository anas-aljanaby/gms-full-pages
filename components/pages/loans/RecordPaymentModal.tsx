import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { Loan, RepaymentInstallment } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecord: (loanId: string, installmentId: string) => void;
    loans: Loan[];
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onRecord, loans }) => {
    const { t, language } = useLocalization();
    const [selectedLoanId, setSelectedLoanId] = useState<string>('');
    const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>('');
    
    useEffect(() => {
        if (!isOpen) {
            setSelectedLoanId('');
            setSelectedInstallmentId('');
        }
    }, [isOpen]);

    const selectedLoan = useMemo(() => {
        return loans.find(l => l.id === selectedLoanId);
    }, [selectedLoanId, loans]);

    const unpaidInstallments = useMemo(() => {
        if (!selectedLoan) return [];
        return selectedLoan.repaymentSchedule.filter(i => i.status === 'Due' || i.status === 'Overdue');
    }, [selectedLoan]);
    
    const selectedInstallment = useMemo(() => {
        return unpaidInstallments.find(i => i.id === selectedInstallmentId);
    }, [selectedInstallmentId, unpaidInstallments]);

    const handleLoanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLoanId(e.target.value);
        setSelectedInstallmentId(''); // Reset installment when loan changes
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLoanId && selectedInstallmentId) {
            onRecord(selectedLoanId, selectedInstallmentId);
        }
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
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('loans.recordPaymentModal.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('loans.recordPaymentModal.selectLoan')}</label>
                            <select value={selectedLoanId} onChange={handleLoanChange} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                <option value="" disabled>-- {t('loans.recordPaymentModal.selectLoan')} --</option>
                                {loans.filter(l => l.status === 'Active').map(loan => (
                                    <option key={loan.id} value={loan.id}>{loan.borrowerName} - {formatCurrency(loan.amount, language, loan.currency)}</option>
                                ))}
                            </select>
                        </div>

                        {selectedLoan && (
                            <div>
                                <label className="block text-sm font-medium">{t('loans.recordPaymentModal.selectInstallment')}</label>
                                <select value={selectedInstallmentId} onChange={e => setSelectedInstallmentId(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="" disabled>-- {t('loans.recordPaymentModal.selectInstallment')} --</option>
                                    {unpaidInstallments.length > 0 ? (
                                        unpaidInstallments.map(inst => (
                                            <option key={inst.id} value={inst.id}>
                                                {t('loans.installment')} #{inst.installmentNumber} - {formatCurrency(inst.amount, language, selectedLoan.currency)} - {t('loans.dueDate')}: {formatDate(inst.dueDate, language)}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>{t('loans.recordPaymentModal.noUnpaidInstallments')}</option>
                                    )}
                                </select>
                            </div>
                        )}
                        
                        {selectedInstallment && selectedLoan && (
                             <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg space-y-2">
                                <h4 className="font-bold">{t('loans.recordPaymentModal.installmentDetails')}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p><span className="font-semibold">{t('loans.installment')}:</span> {selectedInstallment.installmentNumber}</p>
                                    <p><span className="font-semibold">{t('loans.status')}:</span> {selectedInstallment.status}</p>
                                    <p><span className="font-semibold">{t('loans.dueDate')}:</span> {formatDate(selectedInstallment.dueDate, language)}</p>
                                    <p><span className="font-semibold">{t('loans.amount')}:</span> {formatCurrency(selectedInstallment.amount, language, selectedLoan.currency)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('loans.addModal.cancel')}</button>
                        <button type="submit" disabled={!selectedInstallmentId} className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary-dark disabled:bg-gray-400">
                            {t('loans.recordPaymentModal.recordPaymentButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordPaymentModal;