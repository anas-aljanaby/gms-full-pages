
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { GrcRisk, GrcRiskLevel, GrcRiskStatus } from '../../../types';
import { AlertTriangle, Shield, TrendingDown, ThumbsDown, Gavel, PlusCircle, BarChart2, Search, X, ChevronDown, Activity, DollarSign, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskMatrix from './RiskMatrix';
import RiskDetailModal from './RiskDetailModal';
import LogRiskModal from './LogRiskModal';
import AiCard from '../ai/AiCard';
import { MOCK_COMMON_RISKS } from '../../../data/commonRisksData';

interface RiskTabProps {
    risks: GrcRisk[];
}

const KpiCard: React.FC<{ title: string, value: number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft flex items-center gap-4 border border-gray-200 dark:border-slate-700/50">
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
        </div>
    </div>
);

const getLevelStyles = (level: GrcRiskLevel): { text: string, bg: string, border: string } => {
    switch (level) {
        case 'Critical': return { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500' };
        case 'High': return { text: 'text-orange-800 dark:text-orange-200', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500' };
        case 'Medium': return { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500' };
        case 'Low': return { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500' };
        default: return { text: 'text-gray-800 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-slate-700', border: 'border-gray-500' };
    }
};

const StatusBadge: React.FC<{ status: GrcRiskStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const styles: Record<GrcRiskStatus, string> = {
        'identified': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'mitigating': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        'monitored': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'closed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`grc.risk.statuses.${status}`)}</span>;
};

const CommonRiskCard: React.FC<{ risk: GrcRisk }> = ({ risk }) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    const { text, bg, border } = getLevelStyles(risk.level);

    return (
        <motion.div layout className={`p-4 rounded-lg border-l-4 ${border} ${bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{risk.category}</p>
                    <h4 className="font-bold text-md text-foreground dark:text-dark-foreground">{risk.risk}</h4>
                </div>
                <div className={`px-3 py-1 text-sm font-bold rounded-full ${bg} ${text}`}>{risk.score}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="font-semibold text-gray-500 dark:text-gray-400">الأثر</p>
                    <p className="font-bold text-lg text-foreground dark:text-dark-foreground">{risk.impact}</p>
                </div>
                 <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="font-semibold text-gray-500 dark:text-gray-400">الاحتمالية</p>
                    <p className="font-bold text-lg text-foreground dark:text-dark-foreground">{risk.probability}</p>
                </div>
                 <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="font-semibold text-gray-500 dark:text-gray-400">المستوى</p>
                    <p className={`font-bold text-sm ${text}`}>{risk.level}</p>
                </div>
            </div>
            <div className="mt-3">
                <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-sm font-semibold py-2 text-foreground dark:text-dark-foreground">
                    <span>التدابير الوقائية</span>
                    <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <ul className="list-disc list-inside mt-1 p-3 bg-white/50 dark:bg-black/20 rounded text-sm space-y-1 text-foreground dark:text-dark-foreground">
                                {risk.mitigation.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const RiskTab: React.FC<RiskTabProps> = ({ risks: initialRisks }) => {
    const { t, language } = useLocalization();
    const [risks, setRisks] = useState<GrcRisk[]>(initialRisks);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRisk, setSelectedRisk] = useState<GrcRisk | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [commonRiskSearch, setCommonRiskSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const commonRiskCategories = [
        { id: 'operational', label: t('grc.risk.common.operational'), icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />, color: 'text-yellow-600' },
        { id: 'compliance', label: t('grc.risk.common.compliance'), icon: <Gavel className="w-6 h-6 text-purple-600" />, color: 'text-purple-600' },
        { id: 'reputation', label: t('grc.risk.common.reputation'), icon: <ThumbsDown className="w-6 h-6 text-orange-600" />, color: 'text-orange-600' },
        { id: 'data', label: t('grc.risk.common.data'), icon: <Shield className="w-6 h-6 text-blue-600" />, color: 'text-blue-600' },
        { id: 'funding', label: t('grc.risk.common.funding'), icon: <TrendingDown className="w-6 h-6 text-red-600" />, color: 'text-red-600' },
    ];

    const filteredCommonRisks = useMemo(() => {
        const categoryMap: Record<string, string[]> = {
            funding: ['مالي'],
            data: ['سيبراني', 'تقني'],
            reputation: ['سمعة'],
            compliance: ['امتثال', 'قانوني'],
            operational: ['عمليات', 'تشغيلي']
        };

        return MOCK_COMMON_RISKS.filter(risk => {
            const matchesCategory = selectedCategory === 'all' || 
                categoryMap[selectedCategory]?.some(cat => risk.category.includes(cat));
            
            const matchesSearch = commonRiskSearch === '' || 
                                  risk.risk.toLowerCase().includes(commonRiskSearch.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, commonRiskSearch]);


    const kpiStats = useMemo(() => {
        const total = risks.length;
        const critical = risks.filter(r => r.level === 'Critical').length;
        const high = risks.filter(r => r.level === 'High').length;
        const medium = risks.filter(r => r.level === 'Medium').length;
        return { total, critical, high, medium };
    }, [risks]);
    
    const filteredRisks = useMemo(() => {
        return risks.filter(risk => {
            const matchesSearch = searchTerm === '' || (risk.risk && risk.risk.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [risks, searchTerm]);

    const handleLogRisk = (newRisk: Omit<GrcRisk, 'id' | 'mitigation' | 'status'>) => {
        const newFullRisk: GrcRisk = {
            ...newRisk,
            id: `risk-${Date.now()}`,
            mitigation: ["Newly logged mitigation plan to be defined."],
            status: 'identified'
        };
        setRisks(prev => [newFullRisk, ...prev]);
        setIsLogModalOpen(false);
    };

    const LevelBadge: React.FC<{level: GrcRiskLevel}> = ({level}) => {
        const { text, bg } = getLevelStyles(level);
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}>{level}</span>;
    }
    
    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('grc.risk.totalRisks')} value={kpiStats.total} icon={<BarChart2 />} />
                    <KpiCard title={t('grc.risk.criticalRisks')} value={kpiStats.critical} icon={<AlertTriangle className="text-red-500" />} />
                    <KpiCard title={t('grc.risk.highRisks')} value={kpiStats.high} icon={<AlertTriangle className="text-orange-500" />} />
                    <KpiCard title={t('grc.risk.mediumRisks')} value={kpiStats.medium} icon={<AlertTriangle className="text-yellow-500" />} />
                </div>
                
                <AiCard title={t('grc.risk.register')}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative flex-grow w-full sm:w-auto">
                            <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder={t('grc.risk.searchPlaceholder')}
                                className="w-full p-2 pl-10 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                            />
                        </div>
                        <button onClick={() => setIsLogModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg w-full sm:w-auto">
                            <PlusCircle size={16}/> {t('grc.risk.logRisk')}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-2">{t('grc.risk.table.description')}</th>
                                    <th className="p-2">{t('projects.risks.category')}</th>
                                    <th className="p-2 text-center">{t('grc.risk.table.score')}</th>
                                    <th className="p-2">{t('grc.risk.level')}</th>
                                    <th className="p-2">{t('projects.risks.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRisks.map(risk => (
                                    <tr key={risk.id} onClick={() => setSelectedRisk(risk)} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                        <td className="p-3 font-semibold text-foreground dark:text-dark-foreground">{risk.risk}</td>
                                        <td className="p-3 capitalize">{risk.category}</td>
                                        <td className="p-3 text-center">
                                            <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold ${getLevelStyles(risk.level).bg} ${getLevelStyles(risk.level).text}`}>
                                                {risk.score}
                                            </div>
                                        </td>
                                        <td className="p-3"><LevelBadge level={risk.level} /></td>
                                        <td className="p-3"><StatusBadge status={risk.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRisks.length === 0 && (
                            <p className="text-center py-8 text-gray-500">{t('common.noResults')}</p>
                        )}
                    </div>
                </AiCard>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                     <div className="lg:col-span-2">
                        <RiskMatrix risks={risks} onCellClick={() => {}} activeCell={null} />
                    </div>
                    <div className="lg:col-span-3">
                         <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50 h-full flex flex-col">
                            <div className="p-4 border-b dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                    <h3 className="font-bold text-lg">{t('grc.risk.commonRisks')}</h3>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-grow">
                                            <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                            <input type="text" value={commonRiskSearch} onChange={e => setCommonRiskSearch(e.target.value)} placeholder={t('grc.risk.searchPlaceholder')} className="w-full p-2 pl-10 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {commonRiskCategories.map(cat => (
                                        <button key={cat.id} onClick={() => setSelectedCategory(prev => prev === cat.id ? 'all' : cat.id)} className={`p-2 rounded-lg text-center transition-all duration-200 border-2 ${selectedCategory === cat.id ? 'bg-primary-light/50 border-primary' : 'bg-gray-100 dark:bg-slate-800 border-transparent hover:border-gray-300'}`}>
                                            <div className={`mx-auto w-10 h-10 flex items-center justify-center`}>{cat.icon}</div>
                                            <p className={`text-xs font-semibold mt-1 ${cat.color}`}>{cat.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 flex-grow overflow-y-auto">
                                <div className="grid grid-cols-1 gap-4">
                                     {filteredCommonRisks.map(risk => (
                                        <CommonRiskCard key={risk.id} risk={risk} />
                                    ))}
                                </div>
                                {filteredCommonRisks.length === 0 && <p className="text-center text-gray-500 py-8">لا توجد مخاطر مطابقة.</p>}
                            </div>
                         </div>
                    </div>
                </div>

            </div>
            {selectedRisk && <RiskDetailModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
            {isLogModalOpen && <LogRiskModal onClose={() => setIsLogModalOpen(false)} onLog={handleLogRisk} />}
        </>
    );
};

export default RiskTab;