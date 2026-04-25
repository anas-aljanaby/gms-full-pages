import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { HrData, Project, Event } from '../../types';
import { VolunteerIcon } from '../icons/ModuleIcons';
import Tabs from '../common/Tabs';
import SchedulingTab from './hr/SchedulingTab';
import HrDashboard from './hr/HrDashboard';

interface VolunteerManagementPageProps {
    hrData: HrData;
    dispatchHrAction: React.Dispatch<any>;
    projects: Project[];
    events: Event[];
}

const VolunteerManagementPage: React.FC<VolunteerManagementPageProps> = (props) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: t('hr.tabs.overview') },
        { id: 'volunteers', label: t('hr.tabs.volunteers') },
        { id: 'scheduling', label: t('hr.tabs.scheduling') },
        { id: 'assignments', label: t('hr.tabs.assignments') },
        { id: 'hours', label: t('hr.tabs.hours') },
        { id: 'performance', label: t('hr.tabs.performance') },
        { id: 'skills', label: t('hr.tabs.skills') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <HrDashboard {...props} />;
            case 'scheduling':
                return <SchedulingTab {...props} />;
            default:
                 return (
                    <div className="p-8 text-center text-gray-500 bg-card dark:bg-dark-card rounded-xl">
                        <p>{t('placeholder.underConstruction')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <VolunteerIcon /> {t('sidebar.hr')}
            </h1>

            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default VolunteerManagementPage;
