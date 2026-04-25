
import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import type { Role, Language, InstitutionalDonor, HrData, GamificationData, GrcData, KnowledgeData, Project, IncubationData } from './types';

// Providers & Contexts
import { DashboardProvider } from './contexts/DashboardContext';
import { ToastProvider } from './components/common/Toast';
import DashboardErrorBoundary from './components/common/DashboardErrorBoundary';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileSidebar from './components/layout/MobileSidebar';
import BottomNavBar from './components/layout/BottomNavBar';
import AiFab from './components/common/AiFab';
import FeedbackFab from './components/common/FeedbackFab';
import FeedbackModal from './components/feedback/FeedbackModal';

// Data Hooks - Assuming these hooks manage their own data fetching and state
import { useDonorIntelligenceData } from './hooks/useDonorIntelligenceData';
import { useBeneficiaryData } from './hooks/useBeneficiaryData';
import { useLeadershipData } from './hooks/useLeadershipData';
import { useHrData } from './hooks/useHrData';
import { useGamificationData } from './hooks/useGamificationData';
import { useGrcData } from './hooks/useGrcData';
import { useKnowledgeData } from './hooks/useKnowledgeData';
import { MOCK_PROJECTS } from './data/projectData';
import { MOCK_INSTITUTIONAL_DONORS } from './data/institutionalDonorsData';
import { MOCK_INCUBATION_DATA } from './data/incubationData';


// Page Components (Lazy Loaded)
const Dashboard = lazy(() => import('./components/pages/Dashboard'));
const DonorManagement = lazy(() => import('./components/pages/DonorManagement'));
const InstitutionalDonors = lazy(() => import('./components/pages/InstitutionalDonors'));
const LeadershipModule = lazy(() => import('./components/pages/LeadershipModule'));
const SponsorshipManagement = lazy(() => import('./components/pages/SponsorshipManagement'));
const ProjectManagement = lazy(() => import('./components/pages/ProjectManagement'));
const BeneficiariesModule = lazy(() => import('./components/pages/BeneficiariesModule'));
const OrphanageManagement = lazy(() => import('./components/pages/OrphanageManagement'));
const StakeholderManagement = lazy(() => import('./components/pages/StakeholderManagement'));
const VolunteerManagementPage = lazy(() => import('./components/pages/VolunteerManagementPage'));
const FinancialsPage = lazy(() => import('./components/pages/FinancialsPage'));
const InvestmentManagementPage = lazy(() => import('./components/pages/InvestmentManagementPage'));
const LoansPage = lazy(() => import('./components/pages/LoansPage'));
const InventoryManagementPage = lazy(() => import('./components/pages/InventoryManagementPage'));
const ImplementingPartnersList = lazy(() => import('./components/pages/ImplementingPartnersList'));
const PartnerEvaluationsPage = lazy(() => import('./components/pages/PartnerEvaluationsPage'));
const CompliancePage = lazy(() => import('./components/pages/CompliancePage'));
const GrcPage = lazy(() => import('./components/pages/GrcPage'));
const GRIReportingPage = lazy(() => import('./components/pages/GRIReportingPage'));
const ShariaCompliancePage = lazy(() => import('./components/pages/ShariaCompliancePage'));
const ShariaBoardManagementPage = lazy(() => import('./components/pages/ShariaBoardManagementPage'));
const DigitalMarketing = lazy(() => import('./components/pages/DigitalMarketing'));
const AiAutomation = lazy(() => import('./components/pages/AiAutomation'));
const OptimalContactTimingPage = lazy(() => import('./components/pages/OptimalContactTimingPage'));
const SmartMessageCampaign = lazy(() => import('./components/pages/SmartMessageCampaign'));
const AnomalyDetectionPage = lazy(() => import('./components/pages/AnomalyDetectionPage'));
const EducationalMaterials = lazy(() => import('./components/pages/EducationalMaterials'));
const MediaDocumentation = lazy(() => import('./components/pages/MediaDocumentation'));
const GamificationPage = lazy(() => import('./components/pages/GamificationPage'));
const AdminDashboardPage = lazy(() => import('./components/pages/AdminDashboardPage'));
const ReportingPage = lazy(() => import('./components/pages/ReportingPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));
const HelpSupportPage = lazy(() => import('./components/pages/HelpSupportPage'));
const PlaceholderPage = lazy(() => import('./components/pages/PlaceholderPage'));
const BousalaPage = lazy(() => import('./components/pages/BousalaPage'));
const KnowledgeLibraryPage = lazy(() => import('./components/pages/KnowledgeLibraryPage'));
const AddKnowledgePage = lazy(() => import('./components/pages/AddKnowledgePage'));
const KnowledgeStatsPage = lazy(() => import('./components/pages/KnowledgeStatsPage'));
const IncubationPage = lazy(() => import('./components/pages/IncubationPage'));
const IncubationCohortsPage = lazy(() => import('./components/pages/incubation/IncubationCohortsPage'));
const IncubationMentorshipPage = lazy(() => import('./components/pages/incubation/IncubationMentorshipPage'));
const IncubationCurriculumPage = lazy(() => import('./components/pages/incubation/IncubationCurriculumPage'));
const IncubationDemoDayPage = lazy(() => import('./components/pages/incubation/IncubationDemoDayPage'));
const IncubationImpactPage = lazy(() => import('./components/pages/incubation/IncubationImpactPage'));
const IncubationInvestorsPage = lazy(() => import('./components/pages/incubation/IncubationInvestorsPage'));
const IncubationInsightsDashboard = lazy(() => import('./components/pages/incubation/IncubationInsightsDashboard'));
const IncubationSuccessMetricsPage = lazy(() => import('./components/pages/incubation/IncubationSuccessMetricsPage'));
const CommunityForumPage = lazy(() => import('./components/pages/CommunityForumPage'));

// New Incubation pages
const IncubationServicesPage = lazy(() => import('./components/pages/incubation/IncubationServicesPage'));
const IncubationStakeholdersPage = lazy(() => import('./components/pages/incubation/IncubationStakeholdersPage'));
const IncubationRoadmapPage = lazy(() => import('./components/pages/incubation/IncubationRoadmapPage'));
const IncubationCommunityPage = lazy(() => import('./components/pages/incubation/IncubationCommunityPage'));


interface ModuleRendererProps {
    activeModule: string;
    updateActiveModule: (module: string) => void;
    role: Role;
    setMediaFilter: (filter: string | null) => void;
    mediaFilter: string | null;
    enabledLanguages: Language[];
    onEnabledLanguagesChange: (langs: Language[]) => void;
    deepLinkTarget: { id?: string; tab?: string } | null;
    // Add data props to be passed down
    institutionalDonors: InstitutionalDonor[];
    hrData: HrData;
    gamificationData: GamificationData;
    grcData: GrcData;
    knowledgeData: KnowledgeData;
    setKnowledgeData: React.Dispatch<React.SetStateAction<KnowledgeData>>;
    incubationData: IncubationData;
}

const ModuleRenderer: React.FC<ModuleRendererProps> = ({ 
    activeModule, updateActiveModule, role, setMediaFilter, mediaFilter, 
    enabledLanguages, onEnabledLanguagesChange, deepLinkTarget,
    institutionalDonors, hrData, gamificationData, grcData, knowledgeData, setKnowledgeData, incubationData
}) => {
    // Data hooks are called here to pass data down to the relevant modules
    const { donors: intelligenceDonors } = useDonorIntelligenceData();
    const { beneficiaryData } = useBeneficiaryData();
    const { leadershipData } = useLeadershipData();
    const { projects } = { projects: MOCK_PROJECTS as Project[] }; // Simplified for this context
    const { dispatchHrAction } = useHrData();
    const { earnBadge } = useGamificationData();
    const { dispatchGrcAction } = useGrcData();
    const allEvents = useMemo(() => leadershipData.units.flatMap(u => u.stages.flatMap(s => s.events)), [leadershipData.units]);

    switch (activeModule) {
        case 'dashboard': return <Dashboard setActiveModule={updateActiveModule} />;
        case 'donors': return <DonorManagement role={role}/>;
        case 'institutional_donors': return <InstitutionalDonors />;
        case 'leadership': return <LeadershipModule setActiveModule={updateActiveModule} setMediaFilter={setMediaFilter} />;
        case 'sponsorship': return <SponsorshipManagement />;
        case 'projects': return <ProjectManagement beneficiaries={beneficiaryData.beneficiaries} deepLinkTarget={deepLinkTarget} />;
        case 'beneficiaries': return <BeneficiariesModule />;
        case 'orphanages': return <OrphanageManagement />;
        case 'stakeholder_management': return <StakeholderManagement />;
        case 'hr': return <VolunteerManagementPage hrData={hrData} dispatchHrAction={dispatchHrAction} projects={projects} events={allEvents} />;
        case 'financials': return <FinancialsPage />;
        case 'inventory': return <InventoryManagementPage projects={projects} />;
        case 'investments': return <InvestmentManagementPage />;
        case 'loans': return <LoansPage role={role} />;
        case 'implementing_partners': return <ImplementingPartnersList />;
        case 'partner_evaluations': return <PartnerEvaluationsPage />;
        case 'compliance': return <CompliancePage />;
        case 'grc': return <GrcPage grcData={grcData} dispatchGrcAction={dispatchGrcAction} />;
        case 'gri_reporting': return <GRIReportingPage />;
        case 'sharia_compliance': return <ShariaCompliancePage setActiveModule={updateActiveModule} />;
        case 'sharia_board': return <ShariaBoardManagementPage />;
        case 'digital_marketing': return <DigitalMarketing />;
        case 'ai_automation': return <AiAutomation 
                                        donors={intelligenceDonors} 
                                        beneficiaries={beneficiaryData.beneficiaries} 
                                        role={role} 
                                        leadershipData={leadershipData} 
                                        projects={projects} 
                                        setActiveModule={updateActiveModule} 
                                        institutionalDonors={institutionalDonors}
                                        hrData={hrData}
                                        gamificationData={gamificationData}
                                        grcData={grcData}
                                        knowledgeData={knowledgeData}
                                     />;
        case 'bousala': return <BousalaPage projects={projects} hrData={hrData} role={role} />;
        case 'optimal_contact_timing': return <OptimalContactTimingPage role={role} />;
        case 'smart_message_campaign': return <SmartMessageCampaign role={role} />;
        case 'anomaly_detection': return <AnomalyDetectionPage />;
        case 'educational_materials': return <EducationalMaterials />;
        case 'knowledge_library': return <KnowledgeLibraryPage />;
        case 'add_knowledge': return <AddKnowledgePage />;
        case 'knowledge_stats': return <KnowledgeStatsPage />;
        case 'media_documentation': return <MediaDocumentation initialEventFilter={mediaFilter} />;
        case 'gamification': return <GamificationPage gamificationData={gamificationData} earnBadge={earnBadge} />;
        case 'admin_dashboard': return <AdminDashboardPage />;
        case 'reports': return <ReportingPage />;
        case 'settings': return <SettingsPage enabledLanguages={enabledLanguages} onEnabledLanguagesChange={onEnabledLanguagesChange} />;
        case 'help': return <HelpSupportPage />;
        case 'community_forum': return <CommunityForumPage />;
        case 'community_events':
            return <LeadershipModule setActiveModule={updateActiveModule} setMediaFilter={setMediaFilter} />;
        case 'community_founders':
            return <IncubationStakeholdersPage />;
        case 'community':
            return <CommunityForumPage />;
        // Deprecated modules now show a placeholder.
        case 'donor_intelligence':
        case 'individual_donors':
            return <PlaceholderPage moduleKey="donors" />;
        
        // Incubation Module (New & Old routes)
        case 'incubation':
        case 'incubation_overview':
        case 'incubation_application':
        case 'incubation_screening':
            return <IncubationPage moduleKey={activeModule} incubationData={incubationData} setActiveModule={updateActiveModule} />;
        case 'incubation_investors':
            return <IncubationInvestorsPage incubationData={incubationData} setActiveModule={updateActiveModule} />;
        case 'incubation_insights_dashboard': // Kept for backward compatibility
        case 'incubation_insights': // New route
            return <IncubationInsightsDashboard 
                        incubationData={incubationData} 
                        knowledgeData={knowledgeData}
                        setKnowledgeData={setKnowledgeData}
                   />;
        case 'incubation_success_metrics': // Kept for backward compatibility
            return <IncubationSuccessMetricsPage incubationData={incubationData} institutionalDonors={institutionalDonors} setKnowledgeData={setKnowledgeData} />;
        case 'incubation_cohort': // Kept for backward compatibility
            return <IncubationCohortsPage incubationData={incubationData} />;
        case 'incubation_curriculum':
            return <IncubationCurriculumPage incubationData={incubationData} />;
        case 'incubation_mentorship':
            return <IncubationMentorshipPage incubationData={incubationData} />;
        case 'incubation_demoday':
            return <IncubationDemoDayPage incubationData={incubationData} />;
        case 'incubation_impact_reports': // Kept for backward compatibility
        case 'incubation_impact': // New route
            return <IncubationImpactPage incubationData={incubationData} institutionalDonors={institutionalDonors} />;
        case 'incubation_services': // New route
            return <IncubationServicesPage />;
        case 'incubation_stakeholders': // New route
            return <IncubationStakeholdersPage />;
        case 'incubation_network': // Updated route
            return <IncubationCommunityPage incubationData={incubationData} setActiveModule={updateActiveModule} />;
        case 'incubation_roadmap': // New route
            return <IncubationRoadmapPage incubationData={incubationData} setActiveModule={updateActiveModule} />;
        
        // Network routes
        case 'network_forum':
            return <CommunityForumPage />;
        case 'network_events':
            return <LeadershipModule setActiveModule={updateActiveModule} setMediaFilter={setMediaFilter} />;
        case 'network_founders':
            return <IncubationStakeholdersPage />;

        default: return <PlaceholderPage moduleKey={activeModule} />;
    }
};

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
    </div>
);

function App() {
    const [activeModule, setActiveModule] = useState(() => (window.location.hash.substring(1) || 'dashboard').split('/')[0]);
    const [role, setRole] = useState<Role>('Admin');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [enabledLanguages, setEnabledLanguages] = useState<Language[]>(['en', 'ar', 'tr']);
    const [isAiFabVisible, setIsAiFabVisible] = useState(true);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [mediaFilter, setMediaFilter] = useState<string | null>(null);
    const [deepLinkTarget, setDeepLinkTarget] = useState<{ id?: string; tab?: string } | null>(null);

    // Get all necessary data at the top level
    const { hrData } = useHrData();
    const { gamificationData } = useGamificationData();
    const { grcData } = useGrcData();
    const { knowledgeData, setKnowledgeData } = useKnowledgeData();

    const updateActiveModule = useCallback((module: string) => {
        window.location.hash = module;
    }, []);
    
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1) || 'dashboard';
            const [module, targetId, targetTab] = hash.split('/');
            
            setActiveModule(module);
            setDeepLinkTarget(targetId ? { id: targetId, tab: targetTab } : null);
            setMediaFilter(null);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const fabHiddenPages = ['ai_automation', 'help', 'settings'];
        setIsAiFabVisible(!fabHiddenPages.includes(activeModule));
    }, [activeModule]);

    return (
        <DashboardErrorBoundary>
            <DashboardProvider>
                <ToastProvider>
                    <div className="flex h-screen bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground">
                        <Sidebar activeModule={activeModule} setActiveModule={updateActiveModule} role={role} />
                        <MobileSidebar 
                            isOpen={isMobileMenuOpen}
                            onClose={() => setIsMobileMenuOpen(false)}
                            activeModule={activeModule}
                            setActiveModule={updateActiveModule}
                            role={role}
                            setRole={setRole}
                        />
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <Header 
                                role={role} 
                                setRole={setRole} 
                                isMobileMenuOpen={isMobileMenuOpen} 
                                setIsMobileMenuOpen={setIsMobileMenuOpen}
                                enabledLanguages={enabledLanguages}
                                setActiveModule={updateActiveModule}
                            />
                            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <ModuleRenderer 
                                        activeModule={activeModule} 
                                        updateActiveModule={updateActiveModule}
                                        role={role}
                                        setMediaFilter={setMediaFilter}
                                        mediaFilter={mediaFilter}
                                        enabledLanguages={enabledLanguages}
                                        onEnabledLanguagesChange={setEnabledLanguages}
                                        deepLinkTarget={deepLinkTarget}
                                        institutionalDonors={MOCK_INSTITUTIONAL_DONORS}
                                        hrData={hrData}
                                        gamificationData={gamificationData}
                                        grcData={grcData}
                                        knowledgeData={knowledgeData}
                                        setKnowledgeData={setKnowledgeData}
                                        incubationData={MOCK_INCUBATION_DATA}
                                    />
                                </Suspense>
                            </main>
                        </div>
                        {isAiFabVisible && <AiFab onClick={() => updateActiveModule('ai_automation')} />}
                        <FeedbackFab onClick={() => setIsFeedbackOpen(true)} />
                        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                         <BottomNavBar
                            activeModule={activeModule}
                            setActiveModule={updateActiveModule}
                            onMenuClick={() => setIsMobileMenuOpen(true)}
                            notificationCount={3} // Example notification count
                        />
                    </div>
                </ToastProvider>
            </DashboardProvider>
        </DashboardErrorBoundary>
    );
}

export default App;
