import type { Beneficiary } from '../types';

export const MOCK_ORPHAN_DATA: Beneficiary[] = [
  {
    id: 'ben-orp-001',
    name: 'علي خالد',
    beneficiaryType: 'orphan',
    photo: 'https://images.unsplash.com/photo-1519985359926-d63c467a5ee2?q=80&w=200&auto=format&fit=crop',
    type: 'sponsorship',
    country: 'Jordan',
    profile: {
      age: 12,
      city: 'Amman',
      sponsorshipType: 'Full',
      sponsor: { id: 'DN-001', name: 'Demo sponsor' },
      caseManager: { id: 'user-3', name: 'Case Manager' },
      personalInfo: { dob: '2012-05-10', gender: 'ذكر', healthStatus: 'جيدة', guardian: 'Mother' },
      academicInfo: { grade: 'Grade 6', attendance: '98%', level: 'Good' },
      socialInfo: {
        familySituation: 'Lives with mother.',
        housingStatus: 'Rented',
        familyMembers: [{ relation: 'Mother', name: 'Maryam', age: 38 }],
        hobbies: ['Reading'],
        needsAndWishes: ['Laptop for school'],
      },
      programs: { educational: { status: 'Enrolled' } },
    },
    assessments: [],
    milestones: [],
  },
];
