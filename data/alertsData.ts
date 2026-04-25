
import type { Alert } from '../types';

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    text: {
      en: "Demo: Review project PROJ-DEMO-1 budget.",
      ar: 'تجريبي: راجع ميزانية المشروع.',
      tr: 'Demo: Bütçeyi inceleyin.',
    },
    priority: 'high',
    timestamp: new Date().toISOString(),
    targetModule: 'projects',
    targetId: 'PROJ-DEMO-1',
  },
  {
    id: 'alert-2',
    text: {
      en: 'Demo: One follow-up for donors (placeholders reduced).',
      ar: 'تجريبي: متابعة تبرع.',
      tr: 'Demo: Bağışçı takibi.',
    },
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];
