

import React from 'react';
import { MOCK_PLATFORM_ACCOUNTS, MOCK_OVERALL_PERFORMANCE } from '../../../../data/advertisingData';
import PlatformConnectionCard from './advertising/PlatformConnectionCard';
import OverallPerformanceCard from './advertising/OverallPerformanceCard';
import ActiveCampaignsTable from './advertising/ActiveCampaignsTable';
import type { AdCampaign } from '../../../../types';
// FIX: This component was missing from the import list. It has been added to resolve the import error.
import DashboardHeader from './DashboardHeader';
import { useLocalization } from '../../../../hooks/useLocalization';

interface AdvertisingTabProps {
    campaigns: AdCampaign[];
    onOpenCreateAdModal: () => void;
}

const AdvertisingTab: React.FC<AdvertisingTabProps> = ({ campaigns, onOpenCreateAdModal }) => {
    const { t } = useLocalization();
    
    return (
        <div className="space-y-8 animate-fade-in">
            <DashboardHeader onOpenCreateAdModal={onOpenCreateAdModal} />

            <section>
                <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.platforms.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PLATFORM_ACCOUNTS.map(acc => <PlatformConnectionCard key={acc.id} account={acc} />)}
                </div>
            </section>
            
            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.summary.title')}</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <OverallPerformanceCard type="spend" data={MOCK_OVERALL_PERFORMANCE} platforms={MOCK_PLATFORM_ACCOUNTS} />
                    <OverallPerformanceCard type="impressions" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="clicks" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="conversions" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="cost_metrics" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="ranking" data={MOCK_PLATFORM_ACCOUNTS} />
                 </div>
            </section>

            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.active_campaigns.title')}</h2>
                 <ActiveCampaignsTable campaigns={campaigns} />
            </section>
        </div>
    );
};

export default AdvertisingTab;