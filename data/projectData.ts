import type { Project, DocumentItem } from '../types';

/** Demo: tiny fixture set to keep the app light. See git history for full sample data. */
const emptyFS = { burnRate: [] as { month: string; value: number }[], pv: 0, ev: 0, ac: 0, spi: 1, cpi: 1, eac: 0, etc: 0 };

const base = (p: Partial<Project> & Pick<Project, 'id' | 'name' | 'stage' | 'progress' | 'budget' | 'spent'>): Project => ({
  type: 'development',
  plannedStartDate: '2025-01-01T00:00:00Z',
  plannedEndDate: '2025-12-31T00:00:00Z',
  location: { country: 'Turkey', city: 'Istanbul', region: '' },
  stakeholders: {
    donor: 'Demo Donor',
    implementingPartner: 'Demo Partner',
    targetBeneficiaries: '100 households',
    primaryContact: 'Project Manager',
  },
  goal: 'Demo project for UI preview.',
  objectives: ['Deliver core outcomes.'],
  expectedOutcomes: ['Improved access to services.'],
  kpis: [{ id: 'kpi-1', name: 'People reached', unit: 'number', target: '100' }],
  documents: [] as DocumentItem[],
  scopeStatement: {
    inScope: ['Program delivery'],
    outOfScope: ['Capital works'],
    assumptions: ['Stable operations'],
    constraints: ['Budget limit'],
  },
  wbs: {
    id: 'wbs-root',
    name: 'Project',
    type: 'deliverable',
    children: [{ id: 'wbs-1', name: 'Work package 1', type: 'work-package' }],
  },
  schedule: [
    { id: 't1', name: 'Phase 1', start: '2025-01-01', end: '2025-03-01', progress: 40 },
    { id: 't2', name: 'Phase 2', start: '2025-03-02', end: '2025-06-30', progress: 10, dependencies: ['t1'] },
  ],
  criticalPath: ['t1', 't2'],
  costManagement: {
    currency: 'USD',
    budgetDetails: [{ category: 'program', planned: 10000, actual: 1000 }],
    expenseLog: [],
    financialSummary: emptyFS,
  },
  humanResources: { projectTeam: [], raciMatrix: {}, timesheet: [] },
  riskManagement: {
    riskRegister: [
      {
        id: 'r1',
        description: 'Sample operational risk',
        category: 'operational',
        probability: 'low',
        impact: 'low',
        responseStrategy: 'mitigate',
        contingencyPlan: 'N/A',
        owner: 'PM',
        status: 'open',
      },
    ],
  },
  qualityManagement: { standards: [], lessonsLearned: [] },
  monitoring: { evmHistory: [{ month: 'Jan', pv: 1000, ev: 800, ac: 900 }] },
  changeLog: [],
  sdgGoals: [4, 11],
  ...p,
});

export const MOCK_PROJECTS: Project[] = [
  base({
    id: 'PROJ-DEMO-1',
    name: { en: 'Demo — Community Center', ar: 'تجريبي — مركز مجتمعي', tr: 'Demo — Toplum Merkezi' },
    stage: 'planning',
    progress: 12,
    budget: 55000,
    spent: 2500,
  }),
  base({
    id: 'PROJ-DEMO-2',
    name: { en: 'Demo — Food Aid', ar: 'تجريبي — مساعدات غذائية', tr: 'Demo — Gıda Yardımı' },
    stage: 'monitoring',
    type: 'humanitarian',
    progress: 40,
    budget: 120000,
    spent: 48000,
  }),
];
