import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { EventStatus } from '../../../types';

interface StatusBreakdownChartProps {
  statusCounts: Record<EventStatus, number>;
  total: number;
}


/**
 * StatusBreakdownChart - مكون يعرض توزيع حالات الفعاليات على شكل أشرطة تقدم.
 * 
 * @component
 * @param {StatusBreakdownChartProps} props - الخصائص.
 * @returns {JSX.Element} - مكون React
 * 
 * @example
 * const statusCounts = { completed: 10, planned: 5, missed: 2, cancelled: 1 };
 * <StatusBreakdownChart statusCounts={statusCounts} total={18} />
 */
const StatusBreakdownChart: React.FC<StatusBreakdownChartProps> = ({ statusCounts, total }) => {
    const { t, dir } = useLocalization();

    const statuses: { key: EventStatus; color: string }[] = [
        { key: 'completed', color: 'bg-green-500' },
        { key: 'planned', color: 'bg-blue-500' },
        { key: 'in-progress', color: 'bg-yellow-500' },
        { key: 'missed', color: 'bg-orange-500' },
        { key: 'cancelled', color: 'bg-red-500' },
    ];

  return (
    <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('leadership.metrics.eventsStatusBreakdown')}</h4>
        {statuses.map(({ key, color }) => {
            const count = statusCounts[key] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
                <div key={key} className="w-full">
                    <div className="flex justify-between mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>{t(`leadership.eventStatuses.${key}`)}</span>
                        <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                        <div 
                            className={`${color} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )
        })}
    </div>
  );
};

export default StatusBreakdownChart;