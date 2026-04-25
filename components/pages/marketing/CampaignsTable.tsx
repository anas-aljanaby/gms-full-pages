import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Campaign, SortDirection } from '../../../types';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { MoreHorizontalIcon, ChevronDownIcon } from '../../icons/GenericIcons';
import CampaignStatusBadge from './CampaignStatusBadge';

interface CampaignsTableProps {
    campaigns: Campaign[];
    sortColumn: keyof Campaign | null;
    sortDirection: SortDirection;
    onSort: (column: keyof Campaign) => void;
}

const CampaignsTable: React.FC<CampaignsTableProps> = ({ campaigns, sortColumn, sortDirection, onSort }) => {
    const { t, language } = useLocalization();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const paginatedCampaigns = campaigns.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(campaigns.length / rowsPerPage);

    const SortableHeader: React.FC<{ column: keyof Campaign, labelKey: string }> = ({ column, labelKey }) => (
        <th scope="col" className="px-6 py-3">
            <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => onSort(column)}
            >
                {t(labelKey)}
                {sortColumn === column && (
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
            </div>
        </th>
    );

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <SortableHeader column="name" labelKey="digital_marketing.campaigns.table.name" />
                            <SortableHeader column="status" labelKey="digital_marketing.campaigns.table.status" />
                            <SortableHeader column="startDate" labelKey="digital_marketing.campaigns.table.duration" />
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.campaigns.table.progress')}</th>
                            <SortableHeader column="budget" labelKey="digital_marketing.campaigns.table.budget" />
                            <SortableHeader column="spent" labelKey="digital_marketing.campaigns.table.spent" />
                            <SortableHeader column="owner" labelKey="digital_marketing.campaigns.table.owner" />
                            <th scope="col" className="px-6 py-3 text-right">{t('digital_marketing.campaigns.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCampaigns.map(campaign => (
                            <tr key={campaign.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                <td className="px-6 py-4 font-bold text-foreground dark:text-dark-foreground">{campaign.name[language]}</td>
                                <td className="px-6 py-4"><CampaignStatusBadge status={campaign.status} /></td>
                                <td className="px-6 py-4">
                                    {formatDate(campaign.startDate, language)} - {formatDate(campaign.endDate, language)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(campaign.goal.current / campaign.goal.target) * 100}%` }}></div>
                                    </div>
                                    <div className="text-xs text-right mt-1">{Math.round((campaign.goal.current / campaign.goal.target) * 100)}%</div>
                                </td>
                                <td className="px-6 py-4">{formatCurrency(campaign.budget, language)}</td>
                                <td className="px-6 py-4">{formatCurrency(campaign.spent, language)}</td>
                                <td className="px-6 py-4">{campaign.owner}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {campaigns.length === 0 && <div className="text-center py-16 text-gray-500">{t('individual_donors.noResults')}</div>}
            </div>
             <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, campaigns.length)}-{Math.min(currentPage * rowsPerPage, campaigns.length)}</span> of <span className="font-semibold">{campaigns.length}</span></span>
                <ul className="inline-flex items-center -space-x-px">
                    <li><button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight border rounded-l-lg disabled:opacity-50">{t('common.previous')}</button></li>
                    <li><button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight border rounded-r-lg disabled:opacity-50">{t('common.next')}</button></li>
                </ul>
            </nav>
        </div>
    );
};

export default CampaignsTable;
