import React, { useState } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { Email, SortDirection } from '../../../../types';
import { formatDate, formatNumber } from '../../../../lib/utils';
import { MoreHorizontalIcon } from '../../../icons/GenericIcons';
import EmailStatusBadge from './EmailStatusBadge';

interface RecentEmailsTableProps {
    emails: Email[];
}

const RecentEmailsTable: React.FC<RecentEmailsTableProps> = ({ emails }) => {
    const { t, language } = useLocalization();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const paginatedEmails = emails.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(emails.length / rowsPerPage);
    
    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.email.table.email')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.email.table.audience')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.email.table.sent')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.email.table.performance')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('digital_marketing.email.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmails.map(email => (
                            <tr key={email.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-foreground dark:text-dark-foreground">{email.name[language]}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{email.subject[language]}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold">{email.audience.name}</p>
                                    <p className="text-xs text-gray-500">{formatNumber(email.audience.size, language)} recipients</p>
                                </td>
                                <td className="px-6 py-4">
                                    <EmailStatusBadge status={email.status} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {email.status === 'Sent' && email.sentDate ? formatDate(email.sentDate, language) : ''}
                                        {email.status === 'Scheduled' && email.scheduledDate ? formatDate(email.scheduledDate, language) : ''}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4 text-xs">
                                        <div><span className="font-bold">{email.stats.openRate}%</span> {t('digital_marketing.email.table.openRate')}</div>
                                        <div><span className="font-bold">{email.stats.clickRate}%</span> {t('digital_marketing.email.table.clickRate')}</div>
                                        <div><span className="font-bold">{email.stats.conversions}</span> {t('digital_marketing.email.table.conversions')}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {emails.length === 0 && <div className="text-center py-16 text-gray-500">{t('individual_donors.noResults')}</div>}
            </div>
             <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, emails.length)}-{Math.min(currentPage * rowsPerPage, emails.length)}</span> of <span className="font-semibold">{emails.length}</span></span>
                <ul className="inline-flex items-center -space-x-px">
                    <li><button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight border rounded-l-lg disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-700">{t('common.previous')}</button></li>
                    <li><button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight border rounded-r-lg disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-700">{t('common.next')}</button></li>
                </ul>
            </nav>
        </div>
    );
};

export default RecentEmailsTable;
