import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { PartnerIcon } from '../icons/ModuleIcons';

const PartnersDashboard: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card dark:bg-dark-card rounded-2xl shadow-soft">
            <div className="p-6 bg-primary-light dark:bg-primary/20 rounded-full mb-6">
                <div className="text-primary dark:text-secondary">
                    <PartnerIcon />
                </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground dark:text-dark-foreground mb-2">
                {t('sidebar.implementing_partners')}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
                {t('placeholder.underConstruction')}
            </p>
            <p className="max-w-xl text-gray-400 dark:text-gray-500">
                This dashboard for monitoring partner performance and KPIs is currently under development.
            </p>
        </div>
    );
};

export default PartnersDashboard;