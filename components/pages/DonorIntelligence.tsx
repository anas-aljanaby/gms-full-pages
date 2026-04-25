import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { useDonorIntelligenceData } from '../../hooks/useDonorIntelligenceData';
import type { Role, IndividualDonor } from '../../types';
import { DonorIntelligenceIcon } from '../icons/ModuleIcons';
import Spinner from '../common/Spinner';
import CategoryCard from './donor_intelligence/CategoryCard';
import IntelligenceFilterBar from './donor_intelligence/IntelligenceFilterBar';
import IntelligenceTable from './donor_intelligence/IntelligenceTable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDonorCategoryLabel } from '../../lib/utils';
import DonorDetailView from './donors_individual/DonorDetailView';
import { MapPin } from 'lucide-react';

interface DonorIntelligenceProps {
    role: Role;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Hero Donor': '#FFD700',
    'Recurring Donor': '#10B981',
    'Seasonal Donor': '#3B82F6',
    'Event Donor': '#F59E0B',
    'Dormant Donor': '#6B7280',
    'General Donor': '#9CA3AF',
    'New Donor': '#A1A1AA',
};

const DonorIntelligence: React.FC<DonorIntelligenceProps> = ({ role }) => {
    const { t, language, dir } = useLocalization();
    const toast = useToast();
    const { donors, isLoading, updateClassifications } = useDonorIntelligenceData();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState<IndividualDonor | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        program: 'all',
    });

    const categoryCounts = useMemo(() => {
        return donors.reduce((acc, donor) => {
            if (donor.donorCategory) {
                acc[donor.donorCategory] = (acc[donor.donorCategory] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [donors]);

    const pieChartData = useMemo(() => {
        return Object.entries(categoryCounts).map(([name, value]) => ({
            name: getDonorCategoryLabel(name, t),
            value,
        }));
    }, [categoryCounts, t]);

    const handleUpdate = () => {
        setIsUpdating(true);
        setTimeout(() => {
            updateClassifications();
            setIsUpdating(false);
            toast.showSuccess(t('donorIntelligence.updateSuccess', { count: donors.length }), { title: t('toasts.successTitle') });
        }, 1500); // Simulate API call
    };

    if (isLoading && donors.length === 0) {
        return <div className="flex justify-center items-center h-full"><Spinner text={t('common.loading')} /></div>;
    }

    if (selectedDonor) {
        return <DonorDetailView donor={selectedDonor} onBack={() => setSelectedDonor(null)} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col items-center md:items-stretch gap-4">
                <div className="flex justify-center items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                        <DonorIntelligenceIcon /> {t('donorIntelligence.title')}
                    </h1>
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                        <MapPin className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
            </div>

            {role !== 'Staff' && (
                <div>
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark active:bg-secondary-dark rounded-lg transition-colors duration-150 shadow-sm disabled:bg-gray-400"
                    >
                        {isUpdating ? <Spinner size="w-5 h-5" /> : null}
                        {isUpdating ? t('donorIntelligence.updating') : t('donorIntelligence.updateClassifications')}
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.keys(CATEGORY_COLORS).map((category) => (
                            <CategoryCard
                                key={category}
                                category={category}
                                count={categoryCounts[category] || 0}
                            />
                        ))}
                    </div>
                </div>
                <div className="xl:col-span-2 bg-card dark:bg-dark-card rounded-2xl shadow-soft p-4 border dark:border-slate-700/50">
                     <h3 className="text-lg font-bold mb-2 text-center">{t('donorIntelligence.distributionChart')}</h3>
                     <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx={dir === 'rtl' ? '60%' : '40%'} cy="50%" outerRadius={80} label>
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[Object.keys(CATEGORY_COLORS).find(key => getDonorCategoryLabel(key, t) === entry.name) || '']} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="vertical"
                                    align={dir === 'rtl' ? 'left' : 'right'}
                                    verticalAlign="middle"
                                    wrapperStyle={{
                                        [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: '20px',
                                        fontSize: '14px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <IntelligenceFilterBar onFilterChange={setFilters} donors={donors} />

            <IntelligenceTable 
                donors={donors} 
                filters={filters} 
                onDonorSelect={setSelectedDonor}
            />
        </div>
    );
};

export default DonorIntelligence;