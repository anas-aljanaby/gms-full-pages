import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { LandingPage, SortDirection } from '../../../../types';
import { formatDate, formatNumber } from '../../../../lib/utils';
import { MoreHorizontalIcon, ChevronDownIcon } from '../../../icons/GenericIcons';
import { EditIcon, ViewIcon, DuplicateIcon, ArchiveIcon, TrashIcon } from '../../../icons/MarketingIcons';
import LandingPageStatusBadge from './LandingPageStatusBadge';

interface LandingPagesTableProps {
    pages: LandingPage[];
    sortColumn: keyof LandingPage | null;
    sortDirection: SortDirection;
    onSort: (column: keyof LandingPage) => void;
}

const LandingPagesTable: React.FC<LandingPagesTableProps> = ({ pages, sortColumn, sortDirection, onSort }) => {
    const { t, language } = useLocalization();

    const SortableHeader: React.FC<{ column: keyof LandingPage; labelKey: string }> = ({ column, labelKey }) => (
        <th scope="col" className="px-4 py-3">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSort(column)}>
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
                            <th scope="col" className="px-4 py-3">{t('digital_marketing.website_pages.table.pageName')}</th>
                            <th scope="col" className="px-4 py-3">{t('digital_marketing.website_pages.table.status')}</th>
                            <SortableHeader column="performance" labelKey="digital_marketing.website_pages.table.performance" />
                            <SortableHeader column="createdAt" labelKey="digital_marketing.website_pages.table.created" />
                            <SortableHeader column="updatedAt" labelKey="digital_marketing.website_pages.table.lastModified" />
                            <th scope="col" className="px-4 py-3 text-right">{t('digital_marketing.website_pages.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <img className="w-20 h-12 rounded-md object-cover bg-gray-100" src={page.thumbnail} alt={`${page.name} thumbnail`} loading="lazy" />
                                        <div>
                                            <button className="font-bold text-foreground dark:text-dark-foreground hover:underline text-left">{page.name}</button>
                                            <div className="text-xs text-gray-500">{page.url}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4"><LandingPageStatusBadge status={page.status} /></td>
                                <td className="px-4 py-4">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <span>{t('digital_marketing.website_pages.kpi.views')}: <span className="font-semibold">{formatNumber(page.performance.views, language)}</span></span>
                                        <span>{t('digital_marketing.website_pages.kpi.cvr')}: <span className="font-semibold">{page.performance.conversionRate.toFixed(1)}%</span></span>
                                        <span>{t('digital_marketing.website_pages.kpi.unique')}: <span className="font-semibold">{formatNumber(page.performance.uniqueVisitors, language)}</span></span>
                                        <span>{t('digital_marketing.website_pages.kpi.conversions')}: <span className="font-semibold">{formatNumber(page.performance.conversions, language)}</span></span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div>{formatDate(page.createdAt, language)}</div>
                                    <div className="text-xs text-gray-500">by {page.createdBy}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div>{formatDate(page.updatedAt, language)}</div>
                                    <div className="text-xs text-gray-500">by {page.updatedBy}</div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><ViewIcon /></button>
                                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><EditIcon /></button>
                                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {pages.length === 0 && <div className="text-center py-16 text-gray-500">{t('individual_donors.noResults')}</div>}
            </div>
            {/* Pagination would go here */}
        </div>
    );
};

export default LandingPagesTable;