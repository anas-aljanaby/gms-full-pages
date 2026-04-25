
import type { Donation } from '../types';

export const MOCK_DONATIONS: Donation[] = [
  { id: 'D-1', donorId: 'DN-001', amount: 1000, date: '2024-05-20T10:00:00Z', program: 'Education' },
  { id: 'D-2', donorId: 'DN-001', amount: 500, date: '2024-04-20T10:00:00Z', program: 'Education' },
  { id: 'D-3', donorId: 'DN-002', amount: 200, date: '2024-05-10T10:00:00Z', program: 'Healthcare' },
  { id: 'D-4', donorId: 'DN-002', amount: 200, date: '2024-04-10T10:00:00Z', program: 'Community' },
];
