import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { InvestmentIcon } from '../icons/ModuleIcons';
import Tabs from '../common/Tabs';
import InvestmentDashboard from './investments/InvestmentDashboard';
import HoldingsTable from './investments/HoldingsTable';

const InvestmentManagementPage: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: t('investments.tabs.dashboard') },
        { id: 'holdings', label: t('investments.tabs.holdings') },
        { id: 'transactions', label: t('investments.tabs.transactions') },
        { id: 'analytics', label: t('investments.tabs.analytics') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <InvestmentDashboard />;
            case 'holdings':
                return <HoldingsTable />;
            default:
                return (
                    <div className="text-center p-16 bg-card dark:bg-dark-card rounded-xl">
                        <p>{t('placeholder.underConstruction')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <InvestmentIcon /> {t('investment.title')}
            </h1>
            
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default InvestmentManagementPage;