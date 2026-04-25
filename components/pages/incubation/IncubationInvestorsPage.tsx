import React, { useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { IncubationData, Investor } from '../../../types';
import { formatDate, formatNumber } from '../../../lib/utils';
import { Users, DollarSign, BarChart, Tv } from 'lucide-react';

interface IncubationInvestorsPageProps {
  incubationData: IncubationData;
  setActiveModule: (module: string) => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex items-center gap-4">
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
        </div>
    </div>
);


const IncubationInvestorsPage: React.FC<IncubationInvestorsPageProps> = ({ incubationData, setActiveModule }) => {
    const { t, language, dir } = useLocalization();
    const { investors, startups } = incubationData;

    const stats = useMemo(() => {
        const totalInvestors = investors.length;
        // Mock total funds represented
        const totalFunds = 75000000; 
        const mostActiveInvestor = investors.map(inv => {
            const followedCount = startups.filter(s => s.investorIds.includes(inv.id)).length;
            return { name: inv.name, count: followedCount };
        }).sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

        return { totalInvestors, totalFunds, mostActiveInvestor };
    }, [investors, startups]);

    const enrichedInvestors = useMemo(() => {
        return investors.map(investor => {
            const followed = startups.filter(s => s.investorIds.includes(investor.id));
            return { ...investor, startupsFollowed: followed };
        });
    }, [investors, startups]);

    return (
        <div className="space-y-6 animate-fade-in" dir={dir}>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('incubation_investors.title')}</h1>
                <button 
                    onClick={() => setActiveModule('incubation_demoday')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
                >
                    <Tv size={16} /> {t('incubation_investors.viewDemoDay')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title={t('incubation_investors.totalInvestors')} value={stats.totalInvestors} icon={<Users />} />
                <KpiCard title={t('incubation_investors.totalFunds')} value={`${formatNumber(stats.totalFunds / 1000000, language)}M$`} icon={<DollarSign />} />
                <KpiCard title={t('incubation_investors.mostActive')} value={stats.mostActiveInvestor.name} icon={<BarChart />} />
            </div>

            <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft overflow-hidden border dark:border-slate-700/50">
                <div className="overflow-x-auto" data-view-id="incubation_investors.table">
                    <table className="w-full text-sm text-start">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                            <tr>
                                <th className="p-4">{t('incubation_investors.table_investor')}</th>
                                <th className="p-4">{t('incubation_investors.table_fundType')}</th>
                                <th className="p-4">{t('incubation_investors.table_focus')}</th>
                                <th className="p-4">{t('incubation_investors.table_startups')}</th>
                                <th className="p-4">{t('incubation_investors.table_lastInteraction')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground dark:text-dark-foreground">
                            {enrichedInvestors.map(investor => {
                                const fundTypeKey = investor.type.toLowerCase().replace(' ', '_');
                                return (
                                    <tr key={investor.id} className="border-t dark:border-slate-700">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={investor.logoUrl} alt={investor.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <span className="font-bold">{investor.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{t(`incubation_investors.fundTypes.${fundTypeKey}`, investor.type)}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {investor.investmentFocus.map(focus => (
                                                    <span key={focus} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full">{focus}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2" title={investor.startupsFollowed.map(s=>s.name).join(', ')}>
                                                 <span className="font-semibold">{investor.startupsFollowed.length}</span>
                                                 <div className="flex -space-x-2 rtl:space-x-reverse">
                                                    {investor.startupsFollowed.slice(0,3).map(s => <span key={s.id} className="w-6 h-6 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{s.logo}</span>)}
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="p-4">{formatDate(investor.lastInteraction, language)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IncubationInvestorsPage;