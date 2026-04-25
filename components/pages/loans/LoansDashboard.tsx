import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatNumber, formatDate } from '../../../lib/utils';
import { useCountUp } from '../../../hooks/useCountUp';
import type { LoansData, Loan, RepaymentInstallment } from '../../../types';
import { DollarSign, BarChart, AlertTriangle, ListChecks, PlusCircle, CreditCard, Calendar } from 'lucide-react';

interface LoansDashboardProps {
    loansData: LoansData;
    onAddLoan: () => void;
    onRecordPayment: () => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string }> = ({ title, value, icon, subtext }) => (
    <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
        </div>
    </div>
);

const LoansDashboard: React.FC<LoansDashboardProps> = ({ loansData, onAddLoan, onRecordPayment }) => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const stats = useMemo(() => {
        const activeLoans = loansData.loans.filter(l => l.status === 'Active');
        const totalOutstanding = activeLoans.reduce((sum, l) => {
            const paidAmount = l.repaymentSchedule
                .filter(i => i.status === 'Paid')
                .reduce((paidSum, i) => paidSum + i.amount, 0);
            return sum + (l.amount - paidAmount);
        }, 0);

        const allInstallments = loansData.loans.flatMap(l => l.repaymentSchedule);
        const pastDueOrPaid = allInstallments.filter(i => new Date(i.dueDate) <= new Date());
        const paidOnTime = pastDueOrPaid.filter(i => i.status === 'Paid').length;
        const repaymentRate = pastDueOrPaid.length > 0 ? (paidOnTime / pastDueOrPaid.length) * 100 : 100;

        const defaultRate = loansData.loans.length > 0 ? (loansData.loans.filter(l => l.status === 'Default').length / loansData.loans.length) * 100 : 0;

        const loanTypesByValue = activeLoans.reduce((acc, loan) => {
            const type = t(`loans.loanTypes.${loan.type}`);
            acc[type] = (acc[type] || 0) + loan.amount;
            return acc;
        }, {} as Record<string, number>);

        const overdueInstallments = allInstallments
            .filter(i => i.status === 'Overdue')
            .map(i => ({
                ...i,
                borrowerName: loansData.loans.find(l => l.id === i.loanId)?.borrowerName || 'Unknown',
                currency: loansData.loans.find(l => l.id === i.loanId)?.currency || 'USD'
            }))
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return {
            totalOutstanding,
            repaymentRate,
            defaultRate,
            activeLoansCount: activeLoans.length,
            loanTypesByValue,
            overdueInstallments
        };
    }, [loansData, t]);

    const atRiskLoans = useMemo(() => {
        return loansData.loans
            .filter(loan => loan.riskLevel === 'High' || loan.riskLevel === 'Medium')
            .sort((a, b) => {
                const score = { High: 2, Medium: 1, Low: 0 };
                return (score[b.riskLevel!] || 0) - (score[a.riskLevel!] || 0);
            });
    }, [loansData.loans]);

    const pieData = Object.entries(stats.loanTypesByValue).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F'];
    
    const RiskBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' }> = ({ level }) => {
        const styles = {
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[level]}`}>{t(`loans.riskLevels.${level}`)}</span>
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('loans.kpis.total_outstanding')} value={formatCurrency(useCountUp(stats.totalOutstanding), language)} icon={<DollarSign />} />
                <KpiCard title={t('loans.kpis.repayment_rate')} value={`${useCountUp(stats.repaymentRate).toFixed(1)}%`} icon={<BarChart />} />
                <KpiCard title={t('loans.kpis.default_rate')} value={`${useCountUp(stats.defaultRate).toFixed(1)}%`} icon={<AlertTriangle />} />
                <KpiCard title={t('loans.kpis.active_loans')} value={formatNumber(useCountUp(stats.activeLoansCount), language)} icon={<ListChecks />} />
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4 text-center">{t('loans.dashboard.loan_types')}</h3>
                    <div className="h-64">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value, language)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4">{t('loans.dashboard.overdue_installments')}</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats.overdueInstallments.length > 0 ? stats.overdueInstallments.map(inst => (
                            <div key={inst.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div>
                                    <p className="font-semibold text-red-800 dark:text-red-200">{inst.borrowerName}</p>
                                    <p className="text-xs text-red-600 dark:text-red-300">{t('loans.dueDate')}: {formatDate(inst.dueDate, language)}</p>
                                </div>
                                <p className="font-bold text-red-700 dark:text-red-200">{formatCurrency(inst.amount, language, inst.currency)}</p>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-10">{t('loans.dashboard.no_overdue')}</p>
                        )}
                    </div>
                </div>
            </div>

             <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <h3 className="font-bold text-lg mb-4">{t('loans.aiInsightsTitle')}</h3>
                {atRiskLoans.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {atRiskLoans.map(loan => (
                            <div key={loan.id} className={`p-3 rounded-lg border-l-4 ${loan.riskLevel === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'}`}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div className="font-bold">{loan.borrowerName}</div>
                                    <RiskBadge level={loan.riskLevel!} />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(`loans.recommendedActions.${loan.recommendedActionKey!}`)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">{t('loans.noHighRiskLoans')}</p>
                )}
            </div>

            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <h3 className="font-bold text-lg mb-4">{t('loans.dashboard.quick_actions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={onAddLoan} className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50">
                        <PlusCircle className="w-8 h-8 text-primary"/>
                        <span className="font-semibold text-sm">{t('loans.addLoan')}</span>
                    </button>
                    <button onClick={onRecordPayment} className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50">
                        <CreditCard className="w-8 h-8 text-primary"/>
                        <span className="font-semibold text-sm">{t('loans.dashboard.record_payment')}</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50">
                        <Calendar className="w-8 h-8 text-primary"/>
                        <span className="font-semibold text-sm">{t('loans.dashboard.view_schedule')}</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default LoansDashboard;
