import type { Language } from '../types';

export interface AiInsightItem {
  text: Record<Language, string>;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export interface AiInsightsData {
  opportunities: AiInsightItem[];
  alerts: AiInsightItem[];
  recommendations: AiInsightItem[];
  predictions: AiInsightItem[];
}

export const MOCK_AI_INSIGHTS: AiInsightsData = {
  opportunities: [
    {
      text: {
        en: 'Demo: DN-001 has strong engagement — consider a follow-up.',
        ar: 'تجريبي: تفاعل جيد',
        tr: 'Demo: güçlü etkileşim',
      },
      confidence: 0.8,
      impact: 'medium',
    },
  ],
  alerts: [
    {
      text: {
        en: 'Demo: Check burn rate for active projects.',
        ar: 'تجريبي: راقب الميزانية',
        tr: 'Demo: bütçe',
      },
      confidence: 0.7,
      impact: 'low',
    },
  ],
  recommendations: [
    {
      text: {
        en: 'Demo: Re-engage lapsed contacts (sample data is small).',
        ar: 'تجريبي: متابعة',
        tr: 'Demo: takip',
      },
      confidence: 0.6,
      impact: 'medium',
    },
  ],
  predictions: [
    {
      text: {
        en: 'Demo: Q4 trend placeholder.',
        ar: 'تجريبي',
        tr: 'Demo',
      },
      confidence: 0.5,
      impact: 'low',
    },
  ],
};
