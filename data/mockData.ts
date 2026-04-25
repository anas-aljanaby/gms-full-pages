import type { Donor } from '../types';

export const MOCK_DONORS: Donor[] = [
  {
    id: 1,
    name: 'Aisha Al-Farsi',
    email: 'aisha.f@example.com',
    totalDonated: 15000,
    donationCount: 5,
    firstDonation: '2021-03-15T10:00:00Z',
    lastDonation: '2024-05-20T10:00:00Z',
    country: 'UAE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    stage: 'stewardship',
    potentialGift: 5000,
    relationshipHealth: 'Good',
    lastContact: '2024-07-10T10:00:00Z',
    tasks: [],
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@example.com',
    totalDonated: 5000,
    donationCount: 2,
    firstDonation: '2022-01-10T10:00:00Z',
    lastDonation: '2024-06-01T10:00:00Z',
    country: 'USA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    stage: 'cultivating',
    potentialGift: 2000,
    relationshipHealth: 'Good',
    lastContact: '2024-06-15T10:00:00Z',
    tasks: [],
  },
];

export const DASHBOARD_STATS = {
  totalDonations: 200000,
  newDonors: 5,
  activeProjects: 2,
  volunteers: 20,
};

export const MONTHLY_DONATIONS_DATA = [
  { name: 'Jan', donations: 4000 },
  { name: 'Feb', donations: 3200 },
  { name: 'Mar', donations: 4500 },
  { name: 'Apr', donations: 4100 },
];
