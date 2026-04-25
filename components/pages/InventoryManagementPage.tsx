import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Project } from '../../types';
import { InventoryIcon } from '../icons/ModuleIcons';
import Tabs from '../common/Tabs';
import InventoryDashboard from './inventory/InventoryDashboard';
import ItemsList from './inventory/ItemsList';
import StockLevelsView from './inventory/StockLevelsView';
import TransactionsLog from './inventory/TransactionsLog';

interface InventoryManagementPageProps {
    projects: Project[];
}

const InventoryManagementPage: React.FC<InventoryManagementPageProps> = ({ projects }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: t('inventory.tabs.dashboard') },
        { id: 'items', label: t('inventory.tabs.items') },
        { id: 'stockLevels', label: t('inventory.tabs.stockLevels') },
        { id: 'transactions', label: t('inventory.tabs.transactions') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <InventoryDashboard />;
            case 'items':
                return <ItemsList />;
            case 'stockLevels':
                return <StockLevelsView />;
            case 'transactions':
                return <TransactionsLog projects={projects} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <InventoryIcon /> {t('sidebar.inventory')}
            </h1>
            
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default InventoryManagementPage;
