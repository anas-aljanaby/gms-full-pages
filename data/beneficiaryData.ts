import type { BeneficiaryData, Beneficiary, NeedsAssessment } from '../types';
import { MOCK_ORPHAN_DATA } from './orphanData';

const asm1: NeedsAssessment = {
  id: 'asm-001',
  date: '2024-07-10T10:00:00Z',
  assessor: 'Demo',
  povertyScore: 3,
  foodSecurity: 'at_risk',
  housingStatus: 'stable',
  educationalNeeds: 'Textbooks and laptop.',
  suggestedPrograms: ['PROGRAM_EDU_SUPPORT'],
};

const demoStudent: Beneficiary = {
  id: 'ben-001',
  name: 'Yusuf Al-Ahmad',
  beneficiaryType: 'student',
  photo: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=200&auto=format&fit=crop',
  type: 'sponsorship',
  country: 'Turkey',
  assessments: [asm1],
  milestones: [
    { id: 'm1', title: { en: 'Enrolled', ar: 'تسجيل', tr: 'Kayıt' }, status: 'achieved', date: '2023-09-01' },
    { id: 'm2', title: { en: 'In progress', ar: 'قيد التنفيذ', tr: 'Devam' }, status: 'in-progress', date: '2024-09-01' },
  ],
  profile: {
    academicInfo: {
      level: { en: 'University - 2nd Year', ar: 'سنة ثانية', tr: '2. sınıf' },
      field: 'Computer Engineering',
      university: 'Istanbul University',
      gpa: 3.4,
    },
    dob: '2004-08-15',
    gender: 'Male',
    contact: { email: 'yusuf.a@example.com', phone: '+90 555 000 0000', address: 'Istanbul' },
    sponsorshipDetails: { status: 'Active', startDate: '2023-09-01', donorId: 2, studentId: 'stud-001' },
    academicRecords: {
      school: 'Istanbul University',
      grade: '2nd Year',
      gpa: 3.4,
      reports: [{ date: '2024-01-15', name: 'Report 2024', url: '#', gpa: 3.2 }],
    },
    financialAid: { supportAmount: 250, lastPaymentDate: '2024-07-01', paymentHistory: [{ date: '2024-07-01', amount: 250 }] },
    communicationLog: [{ date: '2024-05-20', type: 'Email', notes: 'Check-in call.' }],
    qualificationPrograms: [
      { programId: 'leadership', name: { en: 'Leadership', ar: 'قيادة', tr: 'Liderlik' }, status: 'In Progress' },
    ],
    communityInitiatives: [
      { initiativeId: 'proj-1', name: { en: 'Iftar', ar: 'إفطار', tr: 'İftar' }, role: 'Volunteer' },
    ],
    documents: [],
    aidLog: [
      {
        id: 'aid-1',
        type: 'financial',
        date: new Date().toISOString(),
        description: { en: 'Stipend', ar: 'مخصص', tr: 'Burs' },
        value: 250,
        unit: 'USD',
        status: 'Delivered',
        relatedProjectId: 'proj-educ',
      },
    ],
  },
};

export const INITIAL_BENEFICIARY_DATA: BeneficiaryData = {
  projects: [
    { id: 'proj-educ', name: { en: 'Educational support', ar: 'دعم تعليمي', tr: 'Eğitim desteği' } },
  ],
  beneficiaries: [demoStudent, ...MOCK_ORPHAN_DATA],
};
