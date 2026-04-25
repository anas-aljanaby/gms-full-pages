import React, { useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Campaign } from '../../../types';
import CampaignKpiCard from './CampaignKpiCard';
import { PlusCircleIcon } from '../../icons/GenericIcons';

interface CampaignsDashboardProps {
    campaigns: Campaign[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    onOpenWizard: () => void;
}

const CampaignsDashboard: React.FC<CampaignsDashboardProps> = ({ campaigns, activeFilter, onFilterChange, onOpenWizard }) => {
    const { t } = useLocalization();

    const stats = useMemo(() => {
        const activeCampaigns = campaigns.filter(c => c.status === 'Active');
        const totalSpend = activeCampaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalRevenue = activeCampaigns.reduce((sum, c) => c.goal.type === 'Fundraising' ? sum + c.goal.current : sum, 0);
        const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
        
        const totalConversions = activeCampaigns.reduce((sum, c) => sum + c.goal.current, 0);
        const totalReach = activeCampaigns.reduce((sum, c) => sum + c.audience.size, 0); // Simplified reach
        const conversionRate = totalReach > 0 ? (totalConversions / totalReach) * 100 : 0;

        return {
            active: activeCampaigns.length,
            spend: totalSpend,
            roi: roi,
            conversionRate: conversionRate
        };
    }, [campaigns]);

    const filters = [
        { id: 'all', label: t('digital_marketing.campaigns.filters.all') },
        { id: 'active', label: t('digital_marketing.campaigns.filters.active') },
        { id: 'endingSoon', label: t('digital_marketing.campaigns.filters.endingSoon') },
        { id: 'overBudget', label: t('digital_marketing.campaigns.filters.overBudget') },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                 <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    {t('digital_marketing.campaigns.title')}
                </h2>
                <button 
                    onClick={onOpenWizard}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg transition-colors"
                >
                    <PlusCircleIcon /> {t('digital_marketing.campaigns.create')}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <CampaignKpiCard title={t('digital_marketing.campaigns.kpi.active')} value={stats.active} format="number" />
                <CampaignKpiCard title={t('digital_marketing.campaigns.kpi.spend')} value={stats.spend} format="currency" />
                <CampaignKpiCard title={t('digital_marketing.campaigns.kpi.roi')} value={stats.roi} format="percentage" />
                <CampaignKpiCard title={t('digital_marketing.campaigns.kpi.conversionRate')} value={stats.conversionRate} format="percentage" />
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 pb-2">
                {filters.map(filter => (
                    <button 
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            activeFilter === filter.id 
                            ? 'bg-primary text-white' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CampaignsDashboard;
