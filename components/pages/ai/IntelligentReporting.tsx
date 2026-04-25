import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AiCard from './AiCard';
import { SmartReportingIcon } from '../../icons/AiIcons';
import { SparklesIcon } from '../../icons/GenericIcons';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatCurrency } from '../../../lib/utils';
import { MOCK_DONORS } from '../../../data/mockData';
import type { Language } from '../../../types';


const IntelligentReporting = () => {
    const { t, language } = useLocalization();

    const countryTranslations: Record<string, Record<Language, string>> = {
        'UAE': { en: 'UAE', ar: 'الإمارات', tr: 'BAE' },
        'USA': { en: 'USA', ar: 'أمريكا', tr: 'ABD' },
        'Turkey': { en: 'Turkey', ar: 'تركيا', tr: 'Türkiye' },
        'Canada': { en: 'Canada', ar: 'كندا', tr: 'Kanada' },
        'Spain': { en: 'Spain', ar: 'إسبانيا', tr: 'İspanya' },
        'Japan': { en: 'Japan', ar: 'اليابان', tr: 'Japonya' },
        'Egypt': { en: 'Egypt', ar: 'مصر', tr: 'Mısır' },
        'UK': { en: 'UK', ar: 'بريطانيا', tr: 'İngiltere' },
        'Saudi Arabia': { en: 'Saudi Arabia', ar: 'السعودية', tr: 'Suudi Arabistan' },
    };

    const donationByCountry = MOCK_DONORS.reduce((acc, donor) => {
        if (donor.totalDonated > 0) {
            acc[donor.country] = (acc[donor.country] || 0) + donor.totalDonated;
        }
        return acc;
    }, {} as Record<string, number>);

    const barChartData = Object.entries(donationByCountry).map(([name, donations]) => ({
        originalName: name,
        name: countryTranslations[name]?.[language] || name,
        donations,
    }));

    const healthData = MOCK_DONORS.reduce((acc, donor) => {
        acc[donor.relationshipHealth] = (acc[donor.relationshipHealth] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const healthTranslations: Record<string, Record<Language, string>> = {
        'Good': { en: 'Good', ar: 'جيد', tr: 'İyi' },
        'Moderate': { en: 'Moderate', ar: 'متوسط', tr: 'Orta' },
        'At Risk': { en: 'At Risk', ar: 'في خطر', tr: 'Risk Altında' },
    };

    const pieChartData = Object.entries(healthData).map(([name, value]) => ({ 
        originalName: name,
        name: healthTranslations[name]?.[language] || name, 
        value 
    }));
    
    const COLORS: Record<string, string> = { 'Good': '#22c55e', 'Moderate': '#f59e0b', 'At Risk': '#ef4444' };


    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.intelligent_reporting.insightsTitle')} icon={<SparklesIcon className="w-6 h-6" />}>
                <div className="text-sm space-y-2 text-foreground dark:text-dark-foreground">
                    <p dangerouslySetInnerHTML={{ __html: t('ai_automation.intelligent_reporting.insight1') }} />
                    <p dangerouslySetInnerHTML={{ __html: t('ai_automation.intelligent_reporting.insight2') }} />
                </div>
            </AiCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AiCard title={t('ai_automation.intelligent_reporting.donationsByCountry')}>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => formatCurrency(val as number, language)} />
                                <Tooltip formatter={(val) => formatCurrency(val as number, language)} />
                                <Bar dataKey="donations" fill="hsl(210, 40%, 50%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AiCard>
                <AiCard title={t('ai_automation.intelligent_reporting.donorHealth')}>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.originalName as keyof typeof COLORS]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </AiCard>
            </div>
        </div>
    );
};

export default IntelligentReporting;