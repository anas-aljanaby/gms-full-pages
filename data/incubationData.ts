import type { IncubationData, CurriculumModule, StartupProgress } from '../types';

export const MOCK_MENTORSHIP_SESSIONS = [
  {
    id: 'sess-1',
    startupId: 'su-1',
    mentorId: 'mentor-1',
    date: '2025-02-01T10:00:00Z',
    topic: 'Strategy',
    notes: 'Demo session notes.',
    rating: 4,
  },
  {
    id: 'sess-2',
    startupId: 'su-2',
    mentorId: 'mentor-1',
    date: '2025-02-10T10:00:00Z',
    topic: 'Product',
    notes: 'Follow-up — demo data.',
    rating: 5,
  },
];

const MOCK_CURRICULUM: CurriculumModule[] = [
  {
    week: 1,
    title: { en: 'Module 1: Canvas', ar: 'الوحدة 1', tr: 'Modül 1' },
    description: { en: 'Business model canvas.', ar: 'نموذج العمل.', tr: 'İş modeli.' },
    milestones: [
      {
        id: 'm1-1',
        title: { en: 'Draft canvas', ar: 'مسودة', tr: 'Taslak' },
        description: { en: 'Complete a first draft.', ar: 'أكمل المسودة.', tr: 'Taslağı tamamla.' },
      },
      {
        id: 'm1-2',
        title: { en: 'Customer segments', ar: 'الشرائح', tr: 'Segmentler' },
        description: { en: 'Name two segments.', ar: 'حدد شريحتين.', tr: 'İki segment.' },
      },
    ],
  },
];

const MOCK_STARTUP_PROGRESS: StartupProgress[] = [
  {
    startupId: 'su-1',
    milestoneProgress: [
      {
        milestoneId: 'm1-1',
        status: 'completed',
        completionDate: '2025-01-20T00:00:00Z',
        dueDate: '2025-01-22T00:00:00Z',
      },
      { milestoneId: 'm1-2', status: 'pending', dueDate: '2025-02-15T00:00:00Z' },
    ],
  },
  {
    startupId: 'su-2',
    milestoneProgress: [
      { milestoneId: 'm1-1', status: 'pending', dueDate: '2025-02-20T00:00:00Z' },
    ],
  },
];

export const MOCK_INCUBATION_DATA: IncubationData = {
  mentors: [
    {
      id: 'mentor-1',
      name: 'Sam Mentor',
      specialty: 'Product',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    },
  ],
  investors: [
    {
      id: 'inv-1',
      name: 'Demo Fund',
      type: 'VC',
      logoUrl: 'https://picsum.photos/seed/demo/100/100',
      investmentFocus: ['EdTech'],
      lastInteraction: '2025-03-01T00:00:00Z',
    },
  ],
  startups: [
    {
      id: 'su-1',
      name: 'EduDemo',
      sector: 'EdTech',
      description: 'Personalized learning — demo.',
      logo: '💡',
      stage: 'mvp',
      founder: { name: 'Ali', email: 'ali@example.com' },
      cohortId: 'C-2025-A',
      mentorIds: ['mentor-1'],
      investorIds: ['inv-1'],
      funding: 50000,
      status: 'active',
      jobsCreated: 2,
      financials: { plannedBudget: 50000, actualSpent: 12000 },
    },
    {
      id: 'su-2',
      name: 'FinDemo',
      sector: 'FinTech',
      description: 'Savings app — demo.',
      logo: '💰',
      stage: 'idea',
      founder: { name: 'Sara', email: 'sara@example.com' },
      cohortId: 'C-2025-A',
      mentorIds: ['mentor-1'],
      investorIds: [],
      funding: 0,
      status: 'active',
      financials: { plannedBudget: 20000, actualSpent: 2000 },
    },
  ],
  cohorts: [
    { id: 'C-2025-A', name: 'Cohort 2025-A', startDate: '2025-01-15T00:00:00Z', endDate: '2025-07-15T00:00:00Z', status: 'in-progress' },
  ],
  applications: [
    {
      id: 'APP-001',
      date: '2025-06-15T10:00:00Z',
      founderName: 'Founder A',
      founderEmail: 'a@example.com',
      projectName: 'GreenApp',
      projectDescription: 'Sustainability — demo application.',
      sector: 'Environmental',
      fundingNeed: 50000,
      status: 'Under Review',
      autoScore: 80,
      reviews: [
        { reviewerName: 'Reviewer 1', comment: 'Solid pitch.', score: 4, date: '2025-06-18T14:00:00Z' },
      ],
    },
  ],
  mentorshipSessions: MOCK_MENTORSHIP_SESSIONS,
  curriculum: MOCK_CURRICULUM,
  startupProgress: MOCK_STARTUP_PROGRESS,
};
