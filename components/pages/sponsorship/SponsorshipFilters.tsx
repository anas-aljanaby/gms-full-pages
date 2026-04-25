import React, { useState, useMemo, useEffect } from 'react';
import type { Student, SponsorshipStatus } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { SearchIcon } from '../../icons/GenericIcons';
import { PlusCircleIcon } from '../../icons/GenericIcons';

interface SponsorshipFiltersProps {
  students: Student[];
  onFilterChange: (filters: { search: string; status: SponsorshipStatus | 'all'; country: string; }) => void;
  onAddStudent: () => void;
}

const SponsorshipFilters: React.FC<SponsorshipFiltersProps> = ({ students, onFilterChange, onAddStudent }) => {
  const { t, dir } = useLocalization();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SponsorshipStatus | 'all'>('all');
  const [country, setCountry] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, status, country });
    }, 300); // Debounce search input
    return () => clearTimeout(timer);
  }, [search, status, country, onFilterChange]);
  
  const countryOptions = useMemo(() => {
    const countryCounts: Record<string, number> = {};
    students.forEach(s => {
        countryCounts[s.personalInfo.country] = (countryCounts[s.personalInfo.country] || 0) + 1;
    });
    return Object.entries(countryCounts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [students]);
  
  return (
    <div className="p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <div className={`absolute inset-y-0 flex items-center ${dir === 'ltr' ? 'ps-3' : 'pe-3'} pointer-events-none`}>
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('sponsorship.filters.searchPlaceholder')}
            className={`block w-full p-2.5 ${dir === 'ltr' ? 'ps-10' : 'pe-10'} text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-primary focus:border-primary`}
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as SponsorshipStatus | 'all')} className="w-full md:w-auto p-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-primary focus:border-primary">
          <option value="all">{t('sponsorship.filters.all')}</option>
          <option value="waiting">{t('sponsorship.filters.waiting')}</option>
          <option value="sponsored">{t('sponsorship.filters.sponsored')}</option>
          <option value="graduate">{t('sponsorship.filters.graduate')}</option>
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)} className="w-full md:w-auto p-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-primary focus:border-primary">
          <option value="all">{t('sponsorship.filters.allCountries')}</option>
          {countryOptions.map(([c, count]) => <option key={c} value={c}>{c} ({count})</option>)}
        </select>
        <button
          onClick={onAddStudent}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          <PlusCircleIcon /> {t('sponsorship.actions.addStudent')}
        </button>
      </div>
    </div>
  );
};

export default SponsorshipFilters;
