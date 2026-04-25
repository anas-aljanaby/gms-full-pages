import type { Student } from '../types';

export const MOCK_FINANCIAL_HEALTH = {
  paid: { count: 5, percentage: 60, amount: 5000 },
  overdue: { count: 1, percentage: 10, amount: 500 },
  upcoming: { count: 2, percentage: 30, amount: 2000 },
};

export const MOCK_ALUMNI_IMPACT = {
  totalGraduates: 10,
  employed: 8,
  employmentRate: 80,
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'stud-001',
    personalInfo: {
      name: { en: 'Omar Al-Sayed', native: 'عمر السيد' },
      dateOfBirth: '2002-05-20',
      gender: 'Male',
      country: 'Lebanon',
      city: 'Beirut',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
      contact: { email: 'omar.s@example.com', phone: '+961 3 000 000' },
    },
    status: 'sponsored',
    academicInfo: { level: "Master's", field: 'Engineering', university: 'AUB', gpa: 3.5 },
    story: { short: 'Demo student.', full: '…', aspirations: '…' },
    sponsorship: {
      sponsorId: 1,
      sponsorName: 'Aisha',
      sponsorType: 'individual',
      startDate: '2023-09-01',
      totalAmount: 6000,
      currency: 'USD',
      paidInstallments: 2,
      totalInstallments: 6,
      installments: [],
    },
    academicProgress: [],
    communicationLog: [],
    qualificationPrograms: [],
    communityInitiatives: [],
    createdAt: '2023-08-15',
    updatedAt: '2024-07-10',
  },
  {
    id: 'stud-002',
    personalInfo: {
      name: { en: 'Aylin Yılmaz', native: 'Aylin Yılmaz' },
      dateOfBirth: '2003-11-10',
      gender: 'Female',
      country: 'Turkey',
      city: 'Istanbul',
      photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=200&auto=format&fit=crop',
      contact: { email: 'aylin.y@example.com', phone: '+90 555 000 000' },
    },
    status: 'waiting',
    academicInfo: { level: "Bachelor's", field: 'CS', university: 'Demo University', gpa: 3.2 },
    story: { short: 'Demo waitlist.', full: '…', aspirations: '…' },
    academicProgress: [],
    communicationLog: [],
    qualificationPrograms: [],
    communityInitiatives: [],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
];
