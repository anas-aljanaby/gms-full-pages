import React from 'react';
import type { IndividualDonor } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber } from '../../../lib/utils';

interface TimingDashboardProps {
    donors: IndividualDonor[];
}

const KpiCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-foreground dark:text-dark-foreground mt-2">{value}</p>
    </div>
);

const TimingDashboard: React.FC<TimingDashboardProps> = ({ donors }) => {
    const { t, language } = useLocalization();

    const stats = React.useMemo(() => {
        const analyzedDonors = donors.filter(d => d.timing_updated_at);
        const avgEngagement = analyzedDonors.reduce((sum, d) => sum + (d.engagement_score || 0), 0) / (analyzedDonors.length || 1);
        
        const today = new Date().getDate();
        const dueToday = analyzedDonors.filter(d => d.best_contact_day_of_month === today).length;

        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const predictedThisWeek = analyzedDonors.filter(d => {
            if (!d.next_predicted_donation_date) return false;
            const predDate = new Date(d.next_predicted_donation_date);
            return predDate >= now && predDate <= nextWeek;
        }).length;

        return {
            totalAnalyzed: analyzedDonors.length,
            avgEngagement,
            dueToday,
            predictedThisWeek,
        };
    }, [donors]);

    const animatedTotal = useCountUp(stats.totalAnalyzed);
    const animatedDue = useCountUp(stats.dueToday);
    const animatedPredicted = useCountUp(stats.predictedThisWeek);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title={t('optimalContactTiming.dashboard.totalAnalyzed')} value={formatNumber(animatedTotal, language)} />
            <KpiCard title={t('optimalContactTiming.dashboard.avgEngagement')} value={`${Math.round(stats.avgEngagement)}/100`} />
            <KpiCard title={t('optimalContactTiming.dashboard.dueToday')} value={formatNumber(animatedDue, language)} />
            <KpiCard title={t('optimalContactTiming.dashboard.predictedThisWeek')} value={formatNumber(animatedPredicted, language)} />
        </div>
    );
};

export default TimingDashboard;
