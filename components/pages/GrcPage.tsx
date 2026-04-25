

import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GrcIcon } from '../icons/ModuleIcons';
import Tabs from '../common/Tabs';
import type { GrcData, GrcRisk } from '../../types';
import GrcDashboard from './grc/GrcDashboard';
import GovernanceTab from './grc/GovernanceTab';
import RiskTab from './grc/RiskTab';
import ComplianceTab from './grc/ComplianceTab';
import AuditLogTab from './grc/AuditLogTab';

interface GrcPageProps {
    grcData: GrcData;
    dispatchGrcAction: React.Dispatch<any>;
}

const defaultGrcData: GrcData = {
    policies: [{
        id: '1',
        title: { ar: 'سياسة تجريبية', en: 'Test Policy', tr: 'Test Politikası' },
        status: 'active',
        category: 'General',
        version: '1.0',
        effectiveDate: new Date().toISOString(),
        reviewDate: new Date().toISOString(),
        ownerUserId: 'system'
    }],
    risks: [{
        id: '1',
        // FIX: The risk object now conforms to the GrcRisk type.
        risk: 'Test Risk',
        category: 'operational',
        // FIX: Changed string 'high' to a number.
        impact: 4,
        // FIX: Changed string 'medium' to a number.
        probability: 3,
        score: 12, // riskScore * probability
        level: 'Medium', // Level is now consistent with score
        scope: 'General',
        mitigation: ['Initial test mitigation plan.'],
        // FIX: Added missing status property to the risk object.
        status: 'identified',
    }],
    requirements: [{
        id: '1',
        code: 'REQ-TEST-01',
        title: { ar: 'متطلب تجريبي', en: 'Test Requirement', tr: 'Test Gereksinimi' },
        source: 'internal',
        sourceName: { en: 'Internal', ar: 'داخلي', tr: 'İç' },
        priority: 'medium',
        nextDueDate: new Date().toISOString(),
        status: 'active'
    }],
    decisions: [],
    assessments: [],
    auditLog: []
};

const GrcPage: React.FC<GrcPageProps> = ({ grcData = defaultGrcData, dispatchGrcAction }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('risk');

    const tabs = [
        { id: 'dashboard', label: t('grc.tabs.dashboard') },
        { id: 'governance', label: t('grc.tabs.governance') },
        { id: 'risk', label: t('grc.tabs.risk') },
        { id: 'compliance', label: t('grc.tabs.compliance') },
        { id: 'audit', label: t('grc.tabs.audit') },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return <GrcDashboard grcData={grcData} />;
            case 'governance':
                return <GovernanceTab policies={grcData.policies} decisions={grcData.decisions} />;
            case 'risk':
                return <RiskTab risks={grcData.risks} />;
            case 'compliance':
                return <ComplianceTab requirements={grcData.requirements} assessments={grcData.assessments} />;
            case 'audit':
                return <AuditLogTab log={grcData.auditLog} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <GrcIcon /> {t('sidebar.grc')}
            </h1>

            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default GrcPage;