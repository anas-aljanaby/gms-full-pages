import React, { useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { IndividualDonor } from '../../../types';
import { SearchIcon } from '../../icons/GenericIcons';
import { getDonorCategoryLabel } from '../../../lib/utils';

interface IntelligenceFilterBarProps {
    onFilterChange: React.Dispatch<React.SetStateAction<{ search: string; category: string; program: string; }>>;
    donors: IndividualDonor[];
}

const IntelligenceFilterBar: React.FC<IntelligenceFilterBarProps> = ({ onFilterChange, donors }) => {
    const { t, dir, language } = useLocalization();

    const categoryOptions = useMemo(() => {
        return Array.from(new Set(donors.map(d => d.donorCategory).filter(Boolean)));
    }, [donors]);

    const programOptions = useMemo(() => {
        return Array.from(new Set(donors.map(d => d.primaryProgramInterest).filter(p => p && p !== 'N/A')));
    }, [donors]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-1">
                    <div className={`absolute inset-y-0 flex items-center ${dir === 'ltr' ? 'ps-3' : 'pe-3'} pointer-events-none`}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        name="search"
                        onChange={handleInputChange}
                        placeholder={t('donorIntelligence.searchPlaceholder')}
                        className={`block w-full p-2.5 ${dir === 'ltr' ? 'ps-10' : 'pe-10'} text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700`}
                    />
                </div>
                <select name="category" onChange={handleInputChange} className="p-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                    <option value="all">{t('donorIntelligence.allCategories')}</option>
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{getDonorCategoryLabel(cat!, t)}</option>)}
                </select>
                <select name="program" onChange={handleInputChange} className="p-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                    <option value="all">{t('donorIntelligence.allPrograms')}</option>
                    {programOptions.map(prog => <option key={prog} value={prog}>{prog}</option>)}
                </select>
            </div>
        </div>
    );
};

export default IntelligenceFilterBar;
