import React, { useMemo } from 'react';
import type { LeadershipData, Event } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber, formatDate } from '../../../lib/utils';
import AiCard from '../ai/AiCard';
import { UsersIcon, TargetIcon, ClockIcon } from '../../icons/MetricsIcons';
import { eventTypeToIcon } from '../../icons/LeadershipIcons';
import GaugeChart from '../../common/GaugeChart';

interface LeadershipOverviewProps {
  leadershipData: LeadershipData;
  dispatch: React.Dispatch<any>;
  onEventClick: (event: Event) => void;
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string; subtext?: string }> = ({ title, value, icon, colorClass, subtext }) => (
    <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft h-full">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
        </div>
    </div>
);


const LeadershipOverview: React.FC<LeadershipOverviewProps> = ({ leadershipData, dispatch, onEventClick }) => {
    const { t, language } = useLocalization();

    const globalMetrics = useMemo(() => {
        const allEvents = leadershipData.units.flatMap(u => u.stages.flatMap(s => s.events));
        const totalTeamMembers = leadershipData.units.reduce((sum, u) => sum + u.team.length, 0);
        
        const completableEvents = allEvents.filter(e => e.status !== 'cancelled').length;
        const completedEvents = allEvents.filter(e => e.status === 'completed').length;
        const overallCompletion = completableEvents > 0 ? (completedEvents / completableEvents) * 100 : 0;

        const now = new Date();
        const upcomingEvents = allEvents
            .filter(e => e.status === 'planned' && new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);

        const projectStats = {
            active: leadershipData.studentProjects.filter(p => p.status === 'active').length,
            completed: leadershipData.studentProjects.filter(p => p.status === 'completed').length,
            totalImpact: leadershipData.studentProjects.reduce((sum, p) => sum + (p.impact.beneficiaries || 0), 0),
        };

        return {
            totalTeamMembers,
            overallCompletion,
            upcomingEvents,
            projectStats,
            totalEvents: allEvents.length
        };
    }, [leadershipData]);

    const EventRow: React.FC<{ event: Event }> = ({ event }) => {
        const EventIcon = eventTypeToIcon[event.type];
        return (
            <button onClick={() => onEventClick(event)} className="w-full text-left flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="text-primary dark:text-secondary"><EventIcon /></div>
                    <div>
                        <p className="font-semibold">{event.title[language]}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.date, language)} &bull; {event.facilitator.name}</p>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 flex items-center justify-center bg-card dark:bg-dark-card/50 p-6 rounded-2xl shadow-soft">
                    <GaugeChart 
                        value={globalMetrics.overallCompletion} 
                        label={t('leadership.metrics.overallCompletion')}
                        size={240}
                    />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <KpiCard title={t('leadership.overview.totalEvents')} value={formatNumber(globalMetrics.totalEvents, language)} icon={<ClockIcon />} colorClass="bg-blue-100 text-blue-600" />
                    <KpiCard title={t('leadership.workTeam')} value={formatNumber(globalMetrics.totalTeamMembers, language)} icon={<UsersIcon />} colorClass="bg-purple-100 text-purple-600" />
                    <KpiCard title={t('leadership.projects.activeProjects')} value={formatNumber(globalMetrics.projectStats.active, language)} icon={<TargetIcon/>} colorClass="bg-yellow-100 text-yellow-600" subtext={`${formatNumber(globalMetrics.projectStats.completed, language)} ${t('leadership.projects.statuses.completed')}`} />
                    <KpiCard title={t('leadership.overview.studentProjectImpact')} value={formatNumber(globalMetrics.projectStats.totalImpact, language)} icon={<UsersIcon />} colorClass="bg-teal-100 text-teal-600" subtext={t('leadership.overview.beneficiaries')} />
                </div>
            </div>

            <AiCard title={t('leadership.overview.upcomingEvents')}>
                <div className="space-y-3">
                    {globalMetrics.upcomingEvents.length > 0 ? (
                        globalMetrics.upcomingEvents.map(event => <EventRow key={event.id} event={event} />)
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('leadership.noEventsPlanned')}</p>
                    )}
                </div>
            </AiCard>
        </div>
    );
};

export default LeadershipOverview;