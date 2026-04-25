
import type { GrcData } from '../types';

export const MOCK_GRC_DATA: GrcData = {
  policies: [
    {
      id: 'POL-001',
      title: { en: 'Data privacy', ar: 'خصوصية', tr: 'Gizlilik' },
      category: 'compliance',
      status: 'active',
      version: '1',
      effectiveDate: '2024-01-01',
      reviewDate: '2025-01-01',
      ownerUserId: 'user-1',
    },
  ],
  decisions: [
    {
      id: 'DEC-001',
      title: { en: 'Approve budget', ar: 'موافقة', tr: 'Onay' },
      date: '2024-06-15',
      status: 'approved',
      impact: 'high',
    },
  ],
  risks: [
    {
      id: 'RSK-001',
      risk: 'Donation shortfall',
      category: 'financial',
      probability: 2,
      impact: 3,
      score: 6,
      level: 'Medium',
      scope: 'Org',
      mitigation: ['Diversify'],
      status: 'mitigating',
    },
  ],
  requirements: [
    {
      id: 'REQ-001',
      code: 'R1',
      title: { en: 'Annual report', ar: 'تقرير', tr: 'Rapor' },
      source: 'internal',
      sourceName: { en: 'Board', ar: 'مجلس', tr: 'Kurul' },
      priority: 'high',
      nextDueDate: '2024-12-31',
      status: 'active',
    },
  ],
  assessments: [
    {
      id: 'ASS-001',
      requirementId: 'REQ-001',
      date: '2024-06-30',
      status: 'compliant',
      score: 95,
      assessorId: 'user-2',
    },
  ],
  auditLog: [{ id: 1, module: 'risk', recordType: 'Risk', recordId: 'RSK-001', action: 'create', userId: 'user-2', timestamp: '2024-01-10T10:00:00Z' }],
};
