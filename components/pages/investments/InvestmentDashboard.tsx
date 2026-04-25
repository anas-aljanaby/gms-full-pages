
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { MOCK_KPI_DATA, MOCK_PERFORMANCE_HISTORY } from '../../../data/investmentData';
import type { InvestmentKpi, Portfolio } from '../../../types';

// --- SUB-COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string | number; tooltip: string; unit?: string }> = ({ title, value, tooltip, unit }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft relative group">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-foreground dark:text-dark-foreground mt-1">
            {value}{unit && <span className="text-xl">{unit}</span>}
        </p>
        <div className="absolute bottom-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold">ⓘ</span>
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-800 text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {tooltip}
            </div>
        </div>
    </div>
);

const AssetAllocationChart: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
    const { t } = useLocalization();
    const { theme } = useTheme();

    const allocationData = useMemo(() => {
        const allocation = portfolio.investments.reduce((acc, inv) => {
            const value = inv.quantity * inv.currentPrice;
            acc[inv.assetClass] = (acc[inv.assetClass] || 0) + value;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(allocation).map(([name, value]) => ({
            name: t(`investments.assetClasses.${name}`),
            value,
        }));
    }, [t, portfolio]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                    {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: unknown) => {
                    const numericValue = Number(value);
                    if (isNaN(numericValue)) {
                        return String(value);
                    }
                    return formatCurrency(numericValue, 'en');
                }} />
                <Legend iconSize={10} />
            </PieChart>
        </ResponsiveContainer>
    );
};

const PerformanceChart: React.FC = () => {
    const { language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const data = MOCK_PERFORMANCE_HISTORY.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(language, { month: 'short', year: '2-digit' }),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                <XAxis dataKey="date" tick={{ fill: isDark ? "#fff" : "#333", fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `${formatNumber(val/1000, language)}k`} tick={{ fill: isDark ? "#fff" : "#333" }} />
                <Tooltip formatter={(value: unknown) => {
                    const numericValue = Number(value);
                    if (isNaN(numericValue)) {
                        return String(value);
                    }
                    return formatCurrency(numericValue, language);
                }} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const InvestmentDashboard: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
    const { t, language } = useLocalization();
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard title={t('investments.kpis.portfolioValue')} value={formatCurrency(MOCK_KPI_DATA.portfolioValue, language)} tooltip="Total market value of all investments." />
                <KpiCard title={t('investments.kpis.overallRoi')} value={MOCK_KPI_DATA.overallRoi} unit="%" tooltip="Total Gain / Total Investment Cost" />
                <KpiCard title={t('investments.kpis.ytdReturn')} value={MOCK_KPI_DATA.ytdReturn} unit="%" tooltip="Return since the start of the current year." />
                <KpiCard title={t('investments.kpis.riskScore')} value={MOCK_KPI_DATA.riskScore} unit="/10" tooltip="Calculated based on asset volatility and diversification." />
                <KpiCard title={t('investments.kpis.shariahPercentage')} value={MOCK_KPI_DATA.shariahPercentage} unit="%" tooltip="Percentage of portfolio value in Shariah-compliant assets." />
                <KpiCard title={t('investments.kpis.annualizedReturn')} value={MOCK_KPI_DATA.annualizedReturn} unit="%" tooltip="Geometric average amount of money earned by an investment each year over a given time period." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                    <h3 className="font-semibold mb-4">{t('investments.performanceOverTime')}</h3>
                    <div className="h-80">
                        <PerformanceChart />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                     <h3 className="font-semibold mb-4 text-center">{t('investments.assetAllocation')}</h3>
                     <div className="h-80">
                         <AssetAllocationChart portfolio={portfolio} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDashboard;