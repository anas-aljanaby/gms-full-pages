import React, { useState, lazy, Suspense, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { LoansIcon } from '../icons/ModuleIcons';
import { useLoansData } from '../../hooks/useLoansData';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Loan, LoanStatus, RepaymentInstallment, RepaymentStatus, Role } from '../../types';
import { ChevronDown, PlusCircle, Link as LinkIcon, FileBarChart, HandCoins, Building } from 'lucide-react';
import Tabs from '../common/Tabs';
import LoansDashboard from './loans/LoansDashboard';
import AddLoanModal from './loans/AddLoanModal';
import RecordPaymentModal from './loans/RecordPaymentModal';
import { useToast } from '../../hooks/useToast';
import Spinner from '../common/Spinner';
import Tooltip from '../common/Tooltip';
import { MOCK_INDIVIDUAL_DONORS } from '../../data/individualDonorsData';
import { MOCK_STAKEHOLDERS } from '../../data/stakeholderData';
import { MOCK_PROJECTS } from '../../data/projectData';

const LoansAnalytics = lazy(() => import('./loans/LoansAnalytics'));
const LoansReports = lazy(() => import('./loans/LoansReports'));

const generateSchedule = (loanId: string, totalAmount: number, installments: number, issueDate: Date): RepaymentInstallment[] => {
    const schedule: RepaymentInstallment[] = [];
    const installmentAmount = totalAmount / installments;

    for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(issueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        let status: RepaymentInstallment['status'] = 'Due';
        // For a new loan, an installment can only be overdue if its due date is in the past.
        if (new Date() > dueDate) {
            status = 'Overdue';
        }
        
        schedule.push({
            id: `${loanId}-inst-${i}`,
            loanId,
            installmentNumber: i,
            dueDate: dueDate.toISOString(),
            amount: installmentAmount,
            status,
        });
    }
    return schedule;
};


const LoanStatusBadge: React.FC<{ status: LoanStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const styles: Record<LoanStatus, string> = {
        'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Paid Off': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Default': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    const statusKey = status.replace(' ', '');
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`loans.statuses.${statusKey}`)}</span>;
};

const RepaymentStatusBadge: React.FC<{ status: RepaymentStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const styles: Record<RepaymentStatus, string> = {
        'Paid': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Due': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`loans.repayment_statuses.${status}`)}</span>;
};

const LoanRow: React.FC<{ loan: Loan, language: 'en' | 'ar' | 'tr' }> = ({ loan, language }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useLocalization();

    const donor = MOCK_INDIVIDUAL_DONORS.find(d => d.id === loan.donorId);
    const stakeholder = MOCK_STAKEHOLDERS.find(s => s.id === loan.stakeholderId);
    const project = MOCK_PROJECTS.find(p => p.id === loan.projectId);

    const RiskBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' }> = ({ level }) => {
        const styles = {
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[level]}`}>{t(`loans.riskLevels.${level}`)}</span>
    };

    return (
        <>
            <tr className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td className="p-4 font-bold">{loan.borrowerName}</td>
                <td className="p-4">{t(`loans.loanTypes.${loan.type}`)}</td>
                <td className="p-4 font-semibold">{formatCurrency(loan.amount, language, loan.currency)}</td>
                <td className="p-4"><LoanStatusBadge status={loan.status} /></td>
                <td className="p-4">{formatDate(loan.issueDate, language)}</td>
                <td className="p-4">
                    {loan.riskLevel && loan.recommendedActionKey && (
                        <div className="flex flex-col gap-1 items-start">
                            <RiskBadge level={loan.riskLevel} />
                            <span className="text-xs text-gray-500">{t(`loans.recommendedActions.${loan.recommendedActionKey}`)}</span>
                        </div>
                    )}
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        {donor && <Tooltip text={`${t('loans.integrations.donor')}: ${donor.fullName[language] || donor.fullName.en}`}><HandCoins size={18} className="text-green-500"/></Tooltip>}
                        {stakeholder && <Tooltip text={`${t('loans.integrations.stakeholder')}: ${stakeholder.name[language] || stakeholder.name.en}`}><Building size={18} className="text-purple-500"/></Tooltip>}
                        {project && <Tooltip text={`${t('loans.integrations.project')}: ${project.name[language] || project.name.en}`}><FileBarChart size={18} className="text-blue-500"/></Tooltip>}
                        {loan.financeEntryId && <Tooltip text={`${t('loans.integrations.financeId')}: ${loan.financeEntryId}`}><LinkIcon size={18} className="text-red-500"/></Tooltip>}
                    </div>
                </td>
                <td className="p-4 text-center">
                    <ChevronDown className={`w-5 h-5 transition-transform mx-auto ${isExpanded ? 'rotate-180' : ''}`} />
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                    <td colSpan={8} className="p-4">
                        <h4 className="font-bold mb-2">{t('loans.schedule')}</h4>
                        <div className="max-h-60 overflow-y-auto border rounded-lg dark:border-slate-700">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-slate-900/50 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-start">{t('loans.installment')}</th>
                                        <th className="p-2 text-start">{t('loans.dueDate')}</th>
                                        <th className="p-2 text-end">{t('loans.amount')}</th>
                                        <th className="p-2 text-center">{t('loans.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loan.repaymentSchedule.map(inst => (
                                        <tr key={inst.id} className="border-b dark:border-slate-700 last:border-b-0">
                                            <td className="p-2">{inst.installmentNumber}</td>
                                            <td className="p-2">{formatDate(inst.dueDate, language)}</td>
                                            <td className="p-2 text-end">{formatCurrency(inst.amount, language, loan.currency)}</td>
                                            <td className="p-2 text-center"><RepaymentStatusBadge status={inst.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

interface LoansPageProps {
  role: Role;
}

const LoansPage: React.FC<LoansPageProps> = ({ role }) => {
  const { t, language } = useLocalization();
  const { loansData, dispatchLoansAction } = useLoansData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const { showSuccess, showInfo } = useToast();

    const enrichedLoans = useMemo(() => {
        return loansData.loans.map(loan => {
            if (loan.status !== 'Active') return loan;

            const overdueCount = loan.repaymentSchedule.filter(i => i.status === 'Overdue').length;
            
            let riskLevel: Loan['riskLevel'] = 'Low';
            let recommendedActionKey: Loan['recommendedActionKey'] = 'monitorClosely';

            if (overdueCount >= 2) {
                riskLevel = 'High';
                recommendedActionKey = 'offerCounseling';
            } else if (overdueCount === 1) {
                riskLevel = 'Medium';
                recommendedActionKey = 'sendReminder';
            }

            return { ...loan, riskLevel, recommendedActionKey };
        });
    }, [loansData.loans]);

    const enrichedLoansData = useMemo(() => ({
        ...loansData,
        loans: enrichedLoans,
    }), [enrichedLoans, loansData]);


  const handleAddLoan = (loanData: Omit<Loan, 'id' | 'repaymentSchedule' | 'status'> & { term: number }) => {
      const { term, ...restOfLoanData } = loanData;
      const newLoanId = `L${Date.now()}`;
      const newLoan: Loan = {
          ...restOfLoanData,
          id: newLoanId,
          status: 'Active',
          repaymentSchedule: generateSchedule(newLoanId, loanData.amount, term, new Date(loanData.issueDate)),
      };
      dispatchLoansAction({ type: 'ADD_LOAN', payload: newLoan });
      dispatchLoansAction({ type: 'SIMULATE_FINANCE_POST', payload: { loanId: newLoanId, reason: 'creation' } });
      showInfo(t('loans.finance.postedCreation'));
  };

  const handleRecordPayment = (loanId: string, installmentId: string) => {
    dispatchLoansAction({ type: 'RECORD_PAYMENT', payload: { loanId, installmentId } });
    showSuccess(t('loans.paymentRecordedSuccess'));
    dispatchLoansAction({ type: 'SIMULATE_FINANCE_POST', payload: { loanId, reason: 'payment' } });
    showInfo(t('loans.finance.postedPayment'));
  };


  const tabs = [
    { id: 'dashboard', label: t('loans.tabs.dashboard') },
    { id: 'all-loans', label: t('loans.tabs.all-loans') },
    { id: 'analytics', label: t('loans.tabs.analytics') },
    { id: 'reports', label: t('loans.tabs.reports') },
  ];

  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return <LoansDashboard 
                        loansData={enrichedLoansData} 
                        onAddLoan={() => setIsAddModalOpen(true)} 
                        onRecordPayment={() => setIsRecordPaymentModalOpen(true)} 
                    />;
        case 'all-loans':
            return (
                <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft overflow-hidden border dark:border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                                <tr>
                                    <th className="p-4">{t('loans.borrower')}</th>
                                    <th className="p-4">{t('loans.loanTypes.title')}</th>
                                    <th className="p-4">{t('loans.amount')}</th>
                                    <th className="p-4">{t('loans.status')}</th>
                                    <th className="p-4">{t('loans.issueDate')}</th>
                                    <th className="p-4">{t('loans.riskAndAction')}</th>
                                    <th className="p-4">{t('loans.integrations.title')}</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrichedLoans.map(loan => (
                                    <LoanRow key={loan.id} loan={loan} language={language} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case 'analytics':
            return (
                <Suspense fallback={<Spinner />}>
                    <LoansAnalytics loansData={enrichedLoansData} />
                </Suspense>
            );
        case 'reports':
            return (
                <Suspense fallback={<Spinner />}>
                    <LoansReports loansData={enrichedLoansData} />
                </Suspense>
            );
        default:
            return null;
    }
  };


  return (
    <>
        <AddLoanModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={handleAddLoan} 
        />
        <RecordPaymentModal
            isOpen={isRecordPaymentModalOpen}
            onClose={() => setIsRecordPaymentModalOpen(false)}
            onRecord={handleRecordPayment}
            loans={loansData.loans}
        />
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <LoansIcon /> {t('sidebar.loans')}
                </h1>
                 <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg">
                    <PlusCircle size={18} />
                    {t('loans.addLoan')}
                </button>
            </div>
            
            <Tabs 
                tabs={tabs.filter(tab => {
                    if (tab.id === 'reports' && role !== 'Admin' && role !== 'Manager') {
                        return false;
                    }
                    return true;
                })}
                activeTab={activeTab} 
                onTabClick={setActiveTab} 
            />

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    </>
  );
};

export default LoansPage;