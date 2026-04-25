
import React, { useMemo, useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { IndividualDonor, DonorCategory, SortDirection } from '../../../types';
import { formatCurrency, formatNumber, formatDate } from '../../../lib/utils';
import { ChevronDownIcon, MoreHorizontalIcon } from '../../icons/GenericIcons';

interface IntelligenceTableProps {
    donors: IndividualDonor[];
    filters: { search: string; category: string; program: string; };
    onDonorSelect: (donor: IndividualDonor) => void;
}

const IntelligenceTable: React.FC<IntelligenceTableProps> = ({ donors, filters, onDonorSelect }) => {
    const { t, language } = useLocalization();
    const [sortColumn, setSortColumn] = useState<keyof IndividualDonor | null>('totalDonations');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const filteredAndSortedDonors = useMemo(() => {
        let filtered = donors.filter(donor => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = donor.fullName[language].toLowerCase().includes(searchLower);
            const matchesCategory = filters.category === 'all' || donor.donorCategory === filters.category;
            const matchesProgram = filters.program === 'all' || donor.primaryProgramInterest === filters.program;
            return matchesSearch && matchesCategory && matchesProgram;
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (sortColumn === 'lastDonationDate') {
                    const daysA = a.lastDonationDate ? (new Date().getTime() - new Date(a.lastDonationDate).getTime()) / (1000 * 3600 * 24) : Infinity;
                    const daysB = b.lastDonationDate ? (new Date().getTime() - new Date(b.lastDonationDate).getTime()) / (1000 * 3600 * 24) : Infinity;
                    return sortDirection === 'asc' ? daysA - daysB : daysB - daysA;
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                return 0;
            });
        }
        
        return filtered;
    }, [donors, filters, sortColumn, sortDirection, language]);

    const handleSort = (column: keyof IndividualDonor) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortableHeader: React.FC<{ column: keyof IndividualDonor, labelKey: string }> = ({ column, labelKey }) => (
        <th scope="col" className="px-6 py-3">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort(column)}>
                {t(labelKey)}
                {sortColumn === column && (
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
            </div>
        </th>
    );
    
    const badgeColors: Record<string, string> = {
      SeasonalDonor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      RecurringDonor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      HeroDonor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      GeneralDonor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DormantDonor: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      EventDonor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      NewDonor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
    };

    const CategoryBadge: React.FC<{ category: DonorCategory }> = ({ category }) => {
        const categoryKey = category.replace(/ /g, '');
        const colorClass = badgeColors[categoryKey] || 'bg-gray-200 text-gray-800';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {t(`donorIntelligence.categories.${categoryKey}`)}
            </span>
        );
    };

    const daysSince = (dateString: string) => {
        if (!dateString) return 'N/A';
        const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
        return formatNumber(days, language);
    };

    return (
         <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('donorIntelligence.table.name')}</th>
                            <SortableHeader column="donorCategory" labelKey="donorIntelligence.table.category" />
                            <SortableHeader column="totalDonations" labelKey="donorIntelligence.table.totalDonations" />
                            <SortableHeader column="donationsCount" labelKey="donorIntelligence.table.donationCount" />
                            <SortableHeader column="lastDonationDate" labelKey="donorIntelligence.table.lastDonation" />
                            <th scope="col" className="px-6 py-3">{t('donorIntelligence.table.preferredProgram')}</th>
                            <th scope="col" className="px-6 py-3 text-end">{t('donorIntelligence.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedDonors.map(donor => (
                             <tr key={donor.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                <td className="px-6 py-4 font-bold text-foreground dark:text-dark-foreground">{donor.fullName[language]}</td>
                                <td className="px-6 py-4">{donor.donorCategory && <CategoryBadge category={donor.donorCategory} />}</td>
                                <td className="px-6 py-4 font-semibold">{formatCurrency(donor.totalDonations, language)}</td>
                                <td className="px-6 py-4">{formatNumber(donor.donationsCount || 0, language)}</td>
                                <td className="px-6 py-4">{daysSince(donor.lastDonationDate)}</td>
                                <td className="px-6 py-4">{donor.primaryProgramInterest}</td>
                                <td className="px-6 py-4 text-end">
                                    <button
                                        onClick={() => onDonorSelect(donor)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors text-xs font-semibold"
                                    >
                                        {t('donorIntelligence.table.viewDetails')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
    );
};

export default IntelligenceTable;
