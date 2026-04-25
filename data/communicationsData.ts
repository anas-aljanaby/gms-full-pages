import type { Communication } from '../types';

export const MOCK_COMMUNICATIONS: Communication[] = [
  {
    communication_id: 'C1',
    donor_id: 'DN-001',
    communication_type: 'email',
    sent_at: '2024-05-18T10:00:00Z',
    opened_at: '2024-05-18T19:00:00Z',
    subject: 'Impact update',
    status: 'opened',
  },
  {
    communication_id: 'C2',
    donor_id: 'DN-002',
    communication_type: 'email',
    sent_at: '2024-04-20T10:00:00Z',
    subject: 'Thank you',
    status: 'sent',
  },
];
