import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Project, Beneficiary } from '../../types';
import Tabs from '../common/Tabs';
import ScopeManagementTab from './projects/tabs/ScopeManagementTab';
import ScheduleManagementTab from './projects/tabs/ScheduleManagementTab';
import CostManagementTab from './projects/tabs/CostManagementTab';
import HumanResourcesTab from './projects/tabs/HumanResourcesTab';
import RiskManagementTab from './projects/tabs/RiskManagementTab';
import QualityManagementTab from './projects/tabs/QualityManagementTab';
import DocumentsTab from './projects/tabs/DocumentsTab';
import ReportsTab from './projects/tabs/ReportsTab';
import ChangeLogTab from './projects/tabs/ChangeLogTab';
import BeneficiariesTab from './projects/tabs/BeneficiariesTab';
import MonitoringTab from './projects/tabs/MonitoringTab';
import ProjectOverviewTab from './projects/tabs/ProjectOverviewTab';


interface ProjectDetailViewProps {
    project: Project;
    beneficiaries: Beneficiary[];
    onBack: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, beneficiaries, onBack }) => {
    const { t, language } = useLocalization();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: t('projects.tabs.overview') },
        { id: 'monitoring', label: t('projects.tabs.monitoring') },
        { id: 'scope', label: t('projects.tabs.scope') },
        { id: 'schedule', label: t('projects.tabs.schedule') },
        { id: 'cost', label: t('projects.tabs.cost') },
        { id: 'hr', label: t('projects.tabs.hr') },
        { id: 'risks', label: t('projects.tabs.risks') },
        { id: 'quality', label: t('projects.tabs.quality') },
        { id: 'beneficiaries', label: t('sidebar.beneficiaries') },
        { id: 'documents', label: t('projects.tabs.documents') },
        { id: 'reports', label: t('projects.tabs.reports') },
        { id: 'changeLog', label: t('projects.tabs.changeLog') },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ProjectOverviewTab project={project} />;
            case 'monitoring':
                return <MonitoringTab project={project} />;
            case 'scope':
                return <ScopeManagementTab project={project} />;
            case 'schedule':
                return <ScheduleManagementTab project={project} />;
            case 'cost':
                return <CostManagementTab project={project} />;
            case 'hr':
                return <HumanResourcesTab project={project} />;
            case 'risks':
                return <RiskManagementTab project={project} />;
            case 'quality':
                return <QualityManagementTab project={project} />;
            case 'beneficiaries':
                return <BeneficiariesTab project={project} beneficiaries={beneficiaries} />;
            case 'documents':
                return <DocumentsTab project={project} />;
            case 'reports':
                return <ReportsTab project={project} />;
            case 'changeLog':
                return <ChangeLogTab project={project} />;
            default:
                return <div className="text-center p-8">{t('placeholder.underConstruction')}</div>;
        }
    };


    return (
        <div className="animate-fade-in space-y-4">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-2">
                    &larr; {t('projects.backToList')}
                </button>
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">{project.name[language]}</h1>
                <p className="text-gray-500">{project.id}</p>
            </div>

            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border border-gray-200 dark:border-slate-700/50">
                <div className="px-6 pt-2">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
                </div>
                
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;