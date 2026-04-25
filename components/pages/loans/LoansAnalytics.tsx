import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import type { LoansData } from '../../../types';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface LoansAnalyticsProps {
    loansData: LoansData;
}

const ChartCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50"
    >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="h-80">
            {children}
        </div>
    </motion.div>
);


const LoansAnalytics: React.FC<LoansAnalyticsProps> = ({ loansData }) => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#A0AEC0' : '#4A5568';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const analyticsData = useMemo(() => {
        // Disbursed vs Collected
        const totalDisbursed = loansData.loans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalCollected = loansData.loans.flatMap(l => l.repaymentSchedule)
            .filter(i => i.status === 'Paid')
            .reduce((sum, i) => sum + i.amount, 0);

        const disbursedVsCollected = [
            { name: t('loans.analytics.disbursed'), amount: totalDisbursed },
            { name: t('loans.analytics.collected'), amount: totalCollected },
        ];

        // Repayment Rate Trend (mocked for 6 months)
        const repaymentRateTrend = [
            { month: 'Feb', rate: 95.2 },
            { month: 'Mar', rate: 96.1 },
            { month: 'Apr', rate: 94.8 },
            { month: 'May', rate: 97.3 },
            { month: 'Jun', rate: 96.5 },
            { month: 'Jul', rate: 98.1 },
        ];

        // Distribution by Type
        const distributionByType = loansData.loans.reduce((acc, loan) => {
            const typeName = t(`loans.loanTypes.${loan.type}`);
            acc[typeName] = (acc[typeName] || 0) + loan.amount;
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(distributionByType).map(([name, value]) => ({ name, value }));

        return { disbursedVsCollected, repaymentRateTrend, pieData };
    }, [loansData, t]);

    const PIE_COLORS = ['#0088FE', '#00C49F'];

    const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border dark:border-slate-700 shadow-lg text-sm">
                    <p className="font-bold">{label}</p>
                    {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color }}>
                            {`${p.name}: ${p.dataKey === 'rate' ? `${p.value}%` : formatCurrency(p.value, language)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                {t('loans.analytics.title')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('loans.analytics.repayment_rate_trend')} icon={<LineChartIcon />}>
                    <ResponsiveContainer>
                        <LineChart data={analyticsData.repaymentRateTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis domain={[90, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: textColor }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="rate" name={t('loans.analytics.rate')} stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title={t('loans.analytics.distribution_by_type')} icon={<PieChartIcon />}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={analyticsData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {analyticsData.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            <ChartCard title={t('loans.analytics.disbursed_vs_collected')} icon={<BarChart3 />}>
                 <ResponsiveContainer>
                    <BarChart data={analyticsData.disbursedVsCollected}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => formatCurrency(v, language)} tick={{ fill: textColor }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" name={t('loans.amount')}>
                            {analyticsData.disbursedVsCollected.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#ffc658' : '#82ca9d'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
};

export default LoansAnalytics;