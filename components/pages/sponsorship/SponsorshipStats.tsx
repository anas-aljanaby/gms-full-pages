import React, { useMemo } from 'react';
import type { Student } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import { MOCK_FINANCIAL_HEALTH, MOCK_ALUMNI_IMPACT } from '../../../data/sponsorshipData';
import { HrIcon } from '../../icons/ModuleIcons';

const KpiCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-2xl shadow-soft">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
        {children}
    </div>
);

const ProgressBar: React.FC<{ segments: { percentage: number; color: string; label: string }[] }> = ({ segments }) => (
    <div className="w-full flex h-3 rounded-full overflow-hidden my-2">
        {segments.map((seg, index) => (
            <div key={index} className={seg.color} style={{ width: `${seg.percentage}%` }} title={`${seg.label}: ${seg.percentage}%`}></div>
        ))}
    </div>
);

const SponsorshipStats: React.FC<{ students: Student[] }> = ({ students }) => {
    const { t, language } = useLocalization();

    const stats = useMemo(() => {
        const sponsored = students.filter(s => s.status === 'sponsored').length;
        const waiting = students.filter(s => s.status === 'waiting').length;
        const graduates = students.filter(s => s.status === 'graduate').length;
        const expectedFunding = students
            .filter(s => s.sponsorship)
            .reduce((sum, s) => sum + (s.sponsorship?.totalAmount || 0), 0);
        return { sponsored, waiting, graduates, expectedFunding };
    }, [students]);

    const animatedSponsored = useCountUp(stats.sponsored);
    const animatedWaiting = useCountUp(stats.waiting);
    const animatedFunding = useCountUp(stats.expectedFunding);
    const animatedGraduates = useCountUp(MOCK_ALUMNI_IMPACT.totalGraduates);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title={t('sponsorship.stats.studentStatus')}>
                <div className="flex justify-around items-center h-full">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{formatNumber(animatedSponsored, language)}</p>
                        <p className="text-xs font-medium text-gray-500">{t('sponsorship.stats.sponsored')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-500">{formatNumber(animatedWaiting, language)}</p>
                        <p className="text-xs font-medium text-gray-500">{t('sponsorship.stats.waiting')}</p>
                    </div>
                </div>
            </KpiCard>

            <KpiCard title={t('sponsorship.stats.financialHealth')}>
                <ProgressBar segments={[
                    { percentage: MOCK_FINANCIAL_HEALTH.paid.percentage, color: 'bg-green-500', label: 'Paid' },
                    { percentage: MOCK_FINANCIAL_HEALTH.overdue.percentage, color: 'bg-red-500', label: 'Overdue' },
                    { percentage: MOCK_FINANCIAL_HEALTH.upcoming.percentage, color: 'bg-blue-500', label: 'Upcoming' },
                ]}/>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>🟢 {t('sponsorship.stats.paid')}: {MOCK_FINANCIAL_HEALTH.paid.count}</span>
                    <span>🔴 {t('sponsorship.stats.overdue')}: {MOCK_FINANCIAL_HEALTH.overdue.count}</span>
                    <span>🔵 {t('sponsorship.stats.upcoming')}: {MOCK_FINANCIAL_HEALTH.upcoming.count}</span>
                </div>
            </KpiCard>
            
            <KpiCard title={t('sponsorship.stats.expectedFunding')}>
                 <p className="text-4xl font-bold text-foreground dark:text-dark-foreground text-center pt-2">
                    {formatCurrency(animatedFunding, language)}
                </p>
            </KpiCard>

            <KpiCard title={t('sponsorship.stats.alumniImpact')}>
                <div className="flex justify-around items-center h-full">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-500">{formatNumber(animatedGraduates, language)}</p>
                        <p className="text-xs font-medium text-gray-500">{t('sponsorship.stats.graduates')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-500">{MOCK_ALUMNI_IMPACT.employmentRate}%</p>
                        <p className="text-xs font-medium text-gray-500">{t('sponsorship.stats.employmentRate')}</p>
                    </div>
                </div>
            </KpiCard>
        </div>
    );
};

export default SponsorshipStats;
