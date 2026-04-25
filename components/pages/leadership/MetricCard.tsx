import React from 'react';
import { useCountUp } from '../../../hooks/useCountUp';

interface MetricCardProps {
  title: string;
  value: number;
  Icon: React.FC;
  unit?: '%' | '★';
  colorClass: string;
}

/**
 * MetricCard - بطاقة لعرض مؤشر أداء رئيسي مع أيقونة وقيمة متحركة.
 * 
 * @component
 * @param {MetricCardProps} props - الخصائص.
 * @returns {JSX.Element} - مكون React
 * 
 * @example
 * <MetricCard 
 *   title="On-Time Completion" 
 *   value={95} 
 *   Icon={ClockIcon} 
 *   unit="%" 
 *   colorClass="text-green-500"
 * />
 */
const MetricCard: React.FC<MetricCardProps> = ({ title, value, Icon, unit, colorClass }) => {
  const animatedValue = useCountUp(value, 1500);

  return (
    <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl p-4 rounded-2xl shadow-soft border border-white/20 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-white/50 dark:bg-slate-900/50 ${colorClass}`}>
          <Icon />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h4>
          <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">
            {unit === '★' ? animatedValue.toFixed(1) : Math.round(animatedValue)}
            {unit && <span className="text-xl">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
