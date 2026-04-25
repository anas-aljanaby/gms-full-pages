
import type { KnowledgeData } from '../types';

export const MOCK_KNOWLEDGE_DATA: KnowledgeData = {
    articles: [
        {
            id: 'kl-1',
            title: { en: 'Volunteer best practices', ar: 'ممارسات', tr: 'Uygulamalar' },
            content: { en: 'Short demo article body.', ar: 'نص', tr: 'Metin' },
            category: { en: 'HR', ar: 'الموارد', tr: 'İK' },
            author_id: 'user-1',
            author_name: 'Demo',
            created_date: '2025-01-15T10:00:00Z',
            views: 3,
            tags: ['volunteer'],
        },
        {
            id: 'kl-2',
            title: { en: 'Proposal writing', ar: 'مقترحات', tr: 'Teklif' },
            content: { en: 'Second demo item.', ar: 'نص', tr: 'Metin' },
            category: { en: 'Fundraising', ar: 'تمويل', tr: 'Kaynak' },
            author_id: 'user-2',
            author_name: 'Demo',
            created_date: '2025-01-10T11:00:00Z',
            views: 2,
            tags: ['proposals'],
        },
    ],
    points: [
        {
            user_id: '1',
            user_name: 'Ahmad',
            avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=200&auto=format&fit=crop',
            total_points: 10,
            contributions: 2,
            last_contribution: '2025-01-15T10:00:00Z',
        },
    ],
};
