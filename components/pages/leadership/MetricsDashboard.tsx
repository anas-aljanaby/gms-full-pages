import React, { useMemo } from 'react';
import type { Unit } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import CircularProgressGauge from './CircularProgressGauge';
import MetricCard from './MetricCard';
import StatusBreakdownChart from './StatusBreakdownChart';
import { ClockIcon, UsersIcon, CancelIcon, TargetIcon } from '../../icons/MetricsIcons';

interface MetricsDashboardProps {
  unit: Unit;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ unit }) => {
  const { t } = useLocalization();

  const metrics = useMemo(() => {
    const allEvents = unit.stages.flatMap(s => s.events);
    const totalEvents = allEvents.length;
    
    const statusCounts = {
        completed: allEvents.filter(e => e.status === 'completed').length,
        planned: allEvents.filter(e => e.status === 'planned').length,
        cancelled: allEvents.filter(e => e.status === 'cancelled').length,
        missed: allEvents.filter(e => e.status === 'missed').length,
        'in-progress': allEvents.filter(e => e.status === 'in-progress').length,
    };

    const completableEvents = statusCounts.completed + statusCounts.planned + statusCounts.missed + statusCounts['in-progress'];
    const overallCompletion = completableEvents > 0 ? (statusCounts.completed / completableEvents) * 100 : 0;

    const completedEvents = allEvents.filter(e => e.status === 'completed');
    const onTimeCompleted = completedEvents.filter(e => e.completionDate && new Date(e.completionDate) <= new Date(e.date)).length;
    const onTimeCompletion = completedEvents.length > 0 ? (onTimeCompleted / completedEvents.length) * 100 : 100;

    const cancellationRate = totalEvents > 0 ? (statusCounts.cancelled / totalEvents) * 100 : 0;

    const avgAttendance = completedEvents.length > 0
      ? completedEvents.reduce((sum, e) => sum + (e.attendanceRate || 75), 0) / completedEvents.length
      : 80; // Mock default

    const teamEngagement = 4.2; // Mocked value

    const stageMetrics = unit.stages.map(stage => {
      const stageCompletable = stage.events.filter(e => e.status !== 'cancelled').length;
      const stageCompleted = stage.events.filter(e => e.status === 'completed').length;
      return {
        id: stage.id,
        title: t(`leadership.stages.${stage.id}`, stage.title['en']),
        completion: stageCompletable > 0 ? (stageCompleted / stageCompletable) * 100 : 0,
      };
    });

    return { statusCounts, totalEvents, overallCompletion, onTimeCompletion, cancellationRate, avgAttendance, teamEngagement, stageMetrics };
  }, [unit, t]);

  return (
    <div className="bg-card/50 dark:bg-dark-card/50 p-4 sm:p-6 rounded-2xl shadow-soft mb-8 border border-gray-200 dark:border-slate-700/50">
      <h3 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('leadership.metrics.performanceDashboard')}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Gauges */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-around gap-6 p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/50">
           <CircularProgressGauge value={metrics.overallCompletion} size={150} title={t('leadership.metrics.overallCompletion')} />
           <div className="w-full sm:w-auto lg:w-full flex flex-row sm:flex-col items-center justify-around gap-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:block lg:hidden">{t('leadership.metrics.stageCompletion')}</h4>
              <div className="flex-grow flex w-full justify-around gap-2">
                {metrics.stageMetrics.map(stage => (
                    <CircularProgressGauge key={stage.id} value={stage.completion} size={80} title={stage.title} />
                ))}
              </div>
           </div>
        </div>
        
        {/* Quality Metrics & Breakdown */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MetricCard title={t('leadership.metrics.onTimeCompletion')} value={metrics.onTimeCompletion} Icon={ClockIcon} unit="%" colorClass="text-green-500" />
          <MetricCard title={t('leadership.metrics.avgAttendance')} value={metrics.avgAttendance} Icon={UsersIcon} unit="%" colorClass="text-blue-500" />
          <MetricCard title={t('leadership.metrics.cancellationRate')} value={metrics.cancellationRate} Icon={CancelIcon} unit="%" colorClass="text-red-500" />
          <MetricCard title={t('leadership.metrics.teamEngagement')} value={metrics.teamEngagement} Icon={TargetIcon} unit="★" colorClass="text-yellow-500" />

          <div className="sm:col-span-2 p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/50">
            <StatusBreakdownChart statusCounts={metrics.statusCounts} total={metrics.totalEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;