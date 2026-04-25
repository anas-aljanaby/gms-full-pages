
import React, { useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { formatCurrency, formatNumber, formatDate } from '../../../lib/utils';
import type { LoansData } from '../../../types';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface LoansReportsProps {
    loansData: LoansData;
}

const ReportCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
    </div>
);

const LoansReports: React.FC<LoansReportsProps> = ({ loansData }) => {
    const { t, language } = useLocalization();
    const { showSuccess, showError, showInfo } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    const summary = useMemo(() => {
        const totalLoans = loansData.loans.length;
        const totalValue = loansData.loans.reduce((sum, l) => sum + l.amount, 0);
        const outstandingBalance = loansData.loans.reduce((sum, loan) => {
            const paidAmount = loan.repaymentSchedule
                .filter(i => i.status === 'Paid')
                .reduce((paidSum, i) => paidSum + i.amount, 0);
            return sum + (loan.amount - paidAmount);
        }, 0);
        const allInstallments = loansData.loans.flatMap(l => l.repaymentSchedule);
        const pastDueOrPaid = allInstallments.filter(i => new Date(i.dueDate) <= new Date());
        const paidOnTime = pastDueOrPaid.filter(i => i.status === 'Paid').length;
        const repaymentRate = pastDueOrPaid.length > 0 ? (paidOnTime / pastDueOrPaid.length) * 100 : 100;
        return { totalLoans, totalValue, outstandingBalance, repaymentRate };
    }, [loansData]);

    const agingReport = useMemo(() => {
        const overdueInstallments = loansData.loans
            .flatMap(loan => loan.repaymentSchedule.map(inst => ({...inst, borrowerName: loan.borrowerName, currency: loan.currency})))
            .filter(inst => inst.status === 'Overdue');
        
        const now = new Date().getTime();
        const buckets: Record<string, { count: number, total: number, loans: any[] }> = {
            '1-30': { count: 0, total: 0, loans: [] },
            '31-60': { count: 0, total: 0, loans: [] },
            '60+': { count: 0, total: 0, loans: [] },
        };

        overdueInstallments.forEach(inst => {
            const daysOverdue = Math.floor((now - new Date(inst.dueDate).getTime()) / (1000 * 3600 * 24));
            if (daysOverdue <= 30) {
                buckets['1-30'].count++;
                buckets['1-30'].total += inst.amount;
                buckets['1-30'].loans.push(inst);
            } else if (daysOverdue <= 60) {
                buckets['31-60'].count++;
                buckets['31-60'].total += inst.amount;
                buckets['31-60'].loans.push(inst);
            } else {
                buckets['60+'].count++;
                buckets['60+'].total += inst.amount;
                buckets['60+'].loans.push(inst);
            }
        });
        return buckets;
    }, [loansData]);

    const typeBreakdown = useMemo(() => {
        return loansData.loans.reduce((acc, loan) => {
            const type = loan.type;
            if (!acc[type]) {
                acc[type] = { count: 0, totalValue: 0 };
            }
            acc[type].count++;
            acc[type].totalValue += loan.amount;
            return acc;
        }, {} as Record<string, { count: number, totalValue: number }>);
    }, [loansData]);

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        try {
            showInfo('Generating PDF...');
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("loans_report.pdf");
        } catch (e) {
            showError('Failed to generate PDF.');
            console.error(e);
        }
    };

    const handleExportXLSX = () => {
        try {
            showInfo("Generating XLSX...");
            const wb = XLSX.utils.book_new();
            
            const summaryData = [
                { 'Metric': t('loans.reports.summary.totalLoans'), 'Value': summary.totalLoans },
                { 'Metric': t('loans.reports.summary.totalValue'), 'Value': summary.totalValue },
                { 'Metric': t('loans.reports.summary.outstanding'), 'Value': summary.outstandingBalance },
                { 'Metric': t('loans.reports.summary.repaymentRate'), 'Value': summary.repaymentRate },
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Portfolio Summary");

            const agingData = Object.entries(agingReport).flatMap(([bucket, data]: [string, { count: number; total: number; loans: any[] }]) => 
                data.loans.map(loan => ({
                    'Bucket': t(`loans.reports.aging.buckets.${bucket}`),
                    'Borrower': loan.borrowerName,
                    'Due Date': formatDate(loan.dueDate, language),
                    'Amount': loan.amount
                }))
            );
            const wsAging = XLSX.utils.json_to_sheet(agingData.length > 0 ? agingData : [{}]);
            XLSX.utils.book_append_sheet(wb, wsAging, "Aging Report");

            const typeData = Object.entries(typeBreakdown).map(([type, data]: [string, { count: number; totalValue: number }]) => ({
                'Loan Type': t(`loans.loanTypes.${type}`),
                'Loan Count': data.count,
                'Total Value': data.totalValue,
            }));
            const wsType = XLSX.utils.json_to_sheet(typeData);
            XLSX.utils.book_append_sheet(wb, wsType, "Type Breakdown");
            
            XLSX.writeFile(wb, "loans_report.xlsx");
            showSuccess("Report exported to XLSX.");
        } catch (e) {
            showError("Failed to export to XLSX.");
            console.error(e);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-4">
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">
                    <FileText size={16}/> {t('loans.reports.exportPDF')}
                </button>
                <button onClick={handleExportXLSX} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">
                    <FileSpreadsheet size={16}/> {t('loans.reports.exportXLSX')}
                </button>
            </div>
            <div ref={reportRef} className="space-y-6 p-4 bg-gray-50 dark:bg-dark-background/50 rounded-lg">
                <ReportCard title={t('loans.reports.summary.title')}>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg"><dt className="font-semibold text-gray-500">{t('loans.reports.summary.totalLoans')}</dt><dd className="text-2xl font-bold">{formatNumber(summary.totalLoans, language)}</dd></div>
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg"><dt className="font-semibold text-gray-500">{t('loans.reports.summary.totalValue')}</dt><dd className="text-2xl font-bold">{formatCurrency(summary.totalValue, language)}</dd></div>
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg"><dt className="font-semibold text-gray-500">{t('loans.reports.summary.outstanding')}</dt><dd className="text-2xl font-bold">{formatCurrency(summary.outstandingBalance, language)}</dd></div>
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg"><dt className="font-semibold text-gray-500">{t('loans.reports.summary.repaymentRate')}</dt><dd className="text-2xl font-bold text-green-600">{summary.repaymentRate.toFixed(1)}%</dd></div>
                    </dl>
                </ReportCard>

                <ReportCard title={t('loans.reports.aging.title')}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left font-semibold">
                                <tr><th className="p-2">{t('loans.reports.aging.bucket')}</th><th className="p-2 text-right">{t('loans.reports.aging.loanCount')}</th><th className="p-2 text-right">{t('loans.reports.aging.totalOverdue')}</th></tr>
                            </thead>
                            <tbody>
                                {Object.entries(agingReport).map(([key, value]: [string, { count: number; total: number; loans: any[] }]) => (
                                    <tr key={key} className="border-t dark:border-slate-600"><td className="p-2">{t(`loans.reports.aging.buckets.${key}`)}</td><td className="p-2 text-right">{value.count}</td><td className="p-2 text-right font-mono">{formatCurrency(value.total, language)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
                
                <ReportCard title={t('loans.reports.breakdown.title')}>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left font-semibold">
                                <tr><th className="p-2">{t('loans.loanTypes.title')}</th><th className="p-2 text-right">{t('loans.reports.breakdown.loanCount')}</th><th className="p-2 text-right">{t('loans.reports.breakdown.totalValue')}</th></tr>
                            </thead>
                            <tbody>
                                {Object.entries(typeBreakdown).map(([key, value]: [string, { count: number; totalValue: number }]) => (
                                    <tr key={key} className="border-t dark:border-slate-600"><td className="p-2">{t(`loans.loanTypes.${key}`)}</td><td className="p-2 text-right">{value.count}</td><td className="p-2 text-right font-mono">{formatCurrency(value.totalValue, language)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            </div>
        </div>
    );
};

export default LoansReports;
