import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { useCountUp } from '../../../../hooks/useCountUp';
import { formatNumber, formatCurrency } from '../../../../lib/utils';
import type { AdPlatformAccount } from '../../../../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type CardType = 'spend' | 'impressions' | 'clicks' | 'conversions' | 'cost_metrics' | 'ranking';
interface OverallPerformanceCardProps {
    type: CardType;
    data: any;
    platforms?: AdPlatformAccount[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const OverallPerformanceCard: React.FC<OverallPerformanceCardProps> = ({ type, data, platforms }) => {
    const { t, language } = useLocalization();

    const animatedValue = useCountUp(data[Object.keys(data).find(k => k.toLowerCase().includes(type.split('_')[0])) || 'totalSpend'], 2000);

    const renderContent = () => {
        switch(type) {
            case 'spend':
                const pieData = platforms?.map((p, i) => ({ name: p.name, value: p.metrics.spend, color: COLORS[i % COLORS.length] })) || [];
                return (
                    <>
                        <p className="text-2xl font-bold">{formatCurrency(animatedValue, language)}</p>
                        <div className="h-20 w-20">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={15} outerRadius={25} paddingAngle={2}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                );
            case 'impressions': return <p className="text-2xl font-bold">{formatNumber(Math.round(animatedValue / 1000), language)}k</p>;
            case 'clicks': return <p className="text-2xl font-bold">{formatNumber(Math.round(animatedValue), language)}</p>;
            case 'conversions': return <p className="text-2xl font-bold">{formatNumber(Math.round(animatedValue), language)}</p>;
            case 'cost_metrics': return (
                <div className="grid grid-cols-2 gap-x-2 text-center">
                    <div>
                        <p className="text-xl font-bold">{formatCurrency(data.avgCpc, language)}</p>
                        <p className="text-[10px] text-gray-500">Avg CPC</p>
                    </div>
                     <div>
                        <p className="text-xl font-bold">{formatCurrency(data.avgCpa, language)}</p>
                        <p className="text-[10px] text-gray-500">Avg CPA</p>
                    </div>
                </div>
            );
            case 'ranking':
                const sortedPlatforms = [...(platforms || [])].sort((a,b) => b.metrics.conversions - a.metrics.conversions);
                 return (
                    <ol className="text-xs space-y-1">
                        {sortedPlatforms.slice(0,3).map((p, i) => (
                           <li key={p.id} className="flex items-center gap-2">
                               <span className="font-bold">{i+1}.</span>
                               <span>{p.name}</span>
                           </li>
                        ))}
                    </ol>
                )
            default: return null;
        }
    };

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft col-span-1">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">{t(`digital_marketing.advertising.summary.${type}`)}</h4>
            <div className="flex justify-between items-center mt-2 h-full">
               {renderContent()}
            </div>
        </div>
    );
};

export default OverallPerformanceCard;
