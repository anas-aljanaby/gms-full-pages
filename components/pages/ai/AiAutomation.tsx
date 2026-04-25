
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import Tabs from '../common/Tabs';
import AiAssistant from './ai/AiAssistant';
import DataQuality from './ai/DataQuality';
import WorkflowBuilder from './ai/WorkflowBuilder';
import IntelligentReporting from './ai/IntelligentReporting';
import PredictiveAnalytics from './ai/PredictiveAnalytics';
import DocumentProcessing from './ai/DocumentProcessing';
import SmartSearch from './ai/SmartSearch';
import AutomatedApprovals from './ai/AutomatedApprovals';
import UserFlowWorkshop from './ai/UserFlowWorkshop';
import PlaceholderPage from '../PlaceholderPage';
import type { IndividualDonor, Beneficiary, Role, LeadershipData, Project } from '../../types';
import AIInsightsGenerator from './ai/AIInsightsGenerator';

interface AiAutomationProps {
    donors: IndividualDonor[];
    beneficiaries: Beneficiary[];
    role: Role;
    leadershipData: LeadershipData;
    projects: Project[];
    setActiveModule: (module: string) => void;
}

const AiAutomation: React.FC<AiAutomationProps> = ({ donors, beneficiaries, role, leadershipData, projects, setActiveModule }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('ai_assistant');

    const aiModules = [
        'ai_assistant',
        'insights_generator',
        'data_quality',
        'workflow_automation',
        'user_flow_workshop',
        'intelligent_reporting',
        'predictive_analytics',
        'document_processing',
        'smart_search',
        'automated_approvals'
    ];

    const tabs = aiModules.map(id => ({ id, label: t(`ai_automation.${id}.title`) }));
    
    const renderContent = () => {
        switch (activeTab) {
            case 'ai_assistant': return <AiAssistant donors={donors} beneficiaries={beneficiaries} role={role} leadershipData={leadershipData} projects={projects} setActiveModule={setActiveModule} />;
            case 'insights_generator': return <AIInsightsGenerator donors={donors} beneficiaries={beneficiaries} projects={projects} />;
            case 'data_quality': return <DataQuality />;
            case 'workflow_automation': return <WorkflowBuilder />;
            case 'user_flow_workshop': return <UserFlowWorkshop />;
            case 'intelligent_reporting': return <IntelligentReporting />;
            case 'predictive_analytics': return <PredictiveAnalytics />;
            case 'document_processing': return <DocumentProcessing />;
            case 'smart_search': return <SmartSearch />;
            case 'automated_approvals': return <AutomatedApprovals />;
            default: return <PlaceholderPage moduleKey="ai_automation" />;
        }
    };


    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">{t('ai_automation.title')}</h1>
                <p className="mt-2 max-w-3xl mx-auto text-gray-500 dark:text-gray-400">{t('ai_automation.description')}</p>
            </div>
            
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

            <div className="mt-6 max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default AiAutomation;