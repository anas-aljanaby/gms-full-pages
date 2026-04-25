
import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_MARKETING_METRICS, MOCK_ACTIVITY_FEED } from '../../../data/digitalMarketingData';
import MarketingMetricCard from './MarketingMetricCard';
import RealTimeActivityFeed from './RealTimeActivityFeed';
import QuickActionsPanel from './QuickActionsPanel';

interface MarketingDashboardProps {
    setActiveTab: (tabId: string) => void;
    onOpenCreatePostModal: () => void;
    onOpenSendEmailModal: () => void;
    onOpenCreateAdModal: () => void;
}

const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ 
    setActiveTab,
    onOpenCreatePostModal,
    onOpenSendEmailModal,
    onOpenCreateAdModal
}) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_MARKETING_METRICS.map(metric => (
                    <MarketingMetricCard key={metric.id} metric={metric} />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RealTimeActivityFeed activities={MOCK_ACTIVITY_FEED} />
                </div>
                <div className="lg:col-span-1">
                    <QuickActionsPanel 
                        setActiveTab={setActiveTab}
                        onOpenCreatePostModal={onOpenCreatePostModal}
                        onOpenSendEmailModal={onOpenSendEmailModal}
                        onOpenCreateAdModal={onOpenCreateAdModal}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard;
