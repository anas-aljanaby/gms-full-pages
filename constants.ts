

import {
    DashboardIcon,
    DonorIcon,
    LeadershipIcon,
    SponsorshipIcon,
    ProjectIcon,
    BeneficiaryIcon,
    OrphanageIcon,
    SettingsIcon,
    AiIcon,
    HrIcon,
    FinancialsIcon,
    InvestmentIcon,
    InventoryIcon,
    EducationalMaterialsIcon,
    MediaIcon,
    GamificationIcon,
    AdminDashboardIcon,
    PartnerIcon,
    PartnerEvaluationIcon,
    ComplianceIcon,
    GrcIcon,
    GRIReportingIcon,
    ShariaComplianceIcon,
    TimingIcon,
    SmartMessageIcon,
    AnomalyDetectionIcon,
    HelpSupportIcon,
    DigitalMarketingIcon,
    KnowledgeIcon,
    BousalaIcon,
    LoansIcon,
    IncubationIcon,
    ForumIcon
} from './components/icons/ModuleIcons';
import {
    CommunityServiceIcon,
    ResearchIcon,
    InnovationIcon,
    LeadershipProjectIcon,
    EnvironmentalIcon,
    EducationalIcon,
    CulturalIcon,
} from './components/icons/ProjectIcons';
import type { Role } from './types';

export const SIDEBAR_MODULES: any[] = [
    { key: 'dashboard', icon: DashboardIcon },
    { key: 'bousala', icon: BousalaIcon },
    { key: 'stakeholder_management', icon: HrIcon },
    {
        key: 'community',
        icon: ForumIcon,
        submenu: [
            { key: 'community_forum' },
            { key: 'community_events' },
            { key: 'community_founders' },
        ]
    },
    { key: 'donors', icon: DonorIcon },
    { key: 'institutional_donors', icon: DonorIcon },
    { key: 'beneficiaries', icon: BeneficiaryIcon },
    { key: 'leadership', icon: LeadershipIcon },
    { key: 'admin_dashboard', icon: AdminDashboardIcon },
    { key: 'gamification', icon: GamificationIcon },
    { key: 'sponsorship', icon: SponsorshipIcon },
    { key: 'projects', icon: ProjectIcon },
    {
        key: 'incubation',
        icon: IncubationIcon,
        submenu: [
            { key: 'incubation_overview' },
            { key: 'incubation_roadmap' },
            { key: 'incubation_application' },
            { key: 'incubation_screening' },
            { key: 'incubation_services' },
            { key: 'incubation_curriculum' },
            { key: 'incubation_mentorship' },
            { key: 'incubation_demoday' },
            { key: 'incubation_stakeholders' },
            { key: 'incubation_investors' },
            { key: 'incubation_impact' },
            { key: 'incubation_insights' },
        ]
    },
    { key: 'loans', icon: LoansIcon },
    { key: 'orphanages', icon: OrphanageIcon },
    { key: 'hr', icon: HrIcon },
    { key: 'financials', icon: FinancialsIcon },
    { key: 'inventory', icon: InventoryIcon },
    { key: 'investments', icon: InvestmentIcon },
    { key: 'implementing_partners', icon: PartnerIcon },
    { key: 'partner_evaluations', icon: PartnerEvaluationIcon },
    { key: 'compliance', icon: ComplianceIcon },
    { key: 'grc', icon: GrcIcon },
    { key: 'gri_reporting', icon: GRIReportingIcon },
    { key: 'sharia_compliance', icon: ShariaComplianceIcon },
    { key: 'digital_marketing', icon: DigitalMarketingIcon },
    { key: 'ai_automation', icon: AiIcon },
    { key: 'optimal_contact_timing', icon: TimingIcon },
    { key: 'smart_message_campaign', icon: SmartMessageIcon },
    { key: 'anomaly_detection', icon: AnomalyDetectionIcon },
    { key: 'educational_materials', icon: EducationalMaterialsIcon },
    {
        key: 'knowledge_management',
        icon: KnowledgeIcon,
        submenu: [
            { key: 'knowledge_library' },
            { key: 'add_knowledge' },
            { key: 'knowledge_stats' }
        ]
    },
    { key: 'help', icon: HelpSupportIcon },
    { key: 'settings', icon: SettingsIcon },
];

export const SIDEBAR_MODULES_FOR_PERMISSIONS = SIDEBAR_MODULES.filter(m => !['settings', 'help'].includes(m.key));


export const USER_ROLES: Role[] = ['Admin', 'Manager', 'Staff', 'Volunteer'];


export const EVENT_TYPES = [
    { id: 'lecture', color: 'blue' },
    { id: 'course', color: 'indigo' },
    { id: 'camp', color: 'teal' },
    { id: 'workshop', color: 'purple' },
    { id: 'activity', color: 'orange' },
    { id: 'ceremony', color: 'pink' },
    { id: 'meeting', color: 'gray' },
    { id: 'event', color: 'red' },
];

export const PROJECT_CATEGORIES = [
    { id: 'community-service', icon: CommunityServiceIcon },
    { id: 'research', icon: ResearchIcon },
    { id: 'innovation', icon: InnovationIcon },
    { id: 'leadership', icon: LeadershipProjectIcon },
    { id: 'environmental', icon: EnvironmentalIcon },
    { id: 'educational', icon: EducationalIcon },
    { id: 'cultural', icon: CulturalIcon },
] as const;

export const PROJECT_STATUSES = ['active', 'completed', 'planned', 'on-hold'] as const;