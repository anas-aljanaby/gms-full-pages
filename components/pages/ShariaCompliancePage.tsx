import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { useTheme } from '../../hooks/useTheme';
import { useCountUp } from '../../hooks/useCountUp';
import type { Language } from '../../types';
import { formatNumber, formatCurrency, formatDate } from '../../lib/utils';
import { ShariaComplianceIcon, ShariaBoardIcon } from '../icons/ModuleIcons';
import { CheckCircle, AlertTriangle, FileText, Users, Clock, BookOpen, PlusCircle, XIcon } from 'lucide-react';
import GaugeChart from '../common/GaugeChart';

// --- DATA (Embedded for simplicity) ---

const MOCK_SHARIA_KPI_DATA = {
    complianceRate: 99,
    pendingFatwas: 3,
    recentAlerts: 1,
    zakatDistribution: { current: 185000, target: 250000 },
    contractsUnderReview: 5,
    boardMembers: 6
};

const MOCK_SHARIA_ALERTS = [
    { id: 'sa-1', priority: 'critical', text: { en: 'Interest-bearing transaction detected in account ****1234', ar: 'تم كشف معاملة ربوية في حساب ****1234', tr: '****1234 nolu hesapta faizli işlem tespit edildi' }, timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
    { id: 'sa-2', priority: 'warning', text: { en: 'Contract C-456 with "Global Tech" includes a penalty clause needing review', ar: 'العقد C-456 مع "Global Tech" يتضمن شرط جزائي يحتاج للمراجعة', tr: '"Global Tech" ile yapılan C-456 sözleşmesi, incelenmesi gereken bir ceza maddesi içeriyor' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'sa-3', priority: 'warning', text: { en: 'Zakat distribution to "Education" category nearing its 30% limit', ar: 'توزيع الزكاة على فئة "التعليم" يقترب من حده الأقصى 30%', tr: '"Eğitim" kategorisine yapılan zekat dağıtımı %30 sınırına yaklaşıyor' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
];

const MOCK_COMPLIANCE_TREND_DATA = [
    { name: 'Jan', compliance: 98.2 }, { name: 'Feb', compliance: 98.5 }, { name: 'Mar', compliance: 97.9 },
    { name: 'Apr', compliance: 98.8 }, { name: 'May', compliance: 99.1 }, { name: 'Jun', compliance: 98.7 },
];

const MOCK_SHARIA_ACTIVITIES = [
    { id: 'act-1', icon: '⚖️', text: { en: 'Fatwa #123 regarding cryptocurrency was issued', ar: 'تم إصدار الفتوى رقم 123 بخصوص العملات الرقمية', tr: 'Kripto para birimiyle ilgili 123 numaralı fetva yayınlandı' }, timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString() },
    { id: 'act-2', icon: '📄', text: { en: 'Contract #C-45 approved by Sharia board', ar: 'تمت الموافقة على العقد رقم C-45 من قبل الهيئة الشرعية', tr: 'C-45 numaralı sözleşme Şeriat kurulu tarafından onaylandı' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'act-3', icon: '💰', text: { en: 'New Zakat expenditure of $5,000 logged', ar: 'تم تسجيل نفقة زكاة جديدة بقيمة 5,000 دولار', tr: '5.000 dolarlık yeni zekat harcaması kaydedildi' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { id: 'act-4', icon: '👥', text: { en: 'Sharia board meeting scheduled for Jul 30, 2024', ar: 'تم تحديد اجتماع الهيئة الشرعية في 30 يوليو 2024', tr: 'Şeriat kurulu toplantısı 30 Temmuz 2024 olarak planlandı' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
];

// --- SUB-COMPONENTS ---
const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string; onClick?: () => void; }> = ({ title, value, icon, subtext, onClick }) => (
    <div onClick={onClick} className={`bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all' : ''}`}>
        <div className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg">{icon}</div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-2xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
            {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
    </div>
);

type QuickActionType = 'newFatwa' | 'submitContract' | 'logZakat';
interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: QuickActionType | null;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, actionType }) => {
    const { t } = useLocalization();
    const titles: Record<QuickActionType, string> = {
        newFatwa: t('sharia.actions.newFatwa'),
        submitContract: t('sharia.actions.submitContract'),
        logZakat: t('sharia.actions.logZakat'),
    };
    if (!isOpen || !actionType) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{titles[actionType]}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <p>{t('placeholder.underConstruction')}</p>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const ShariaCompliancePage: React.FC<{setActiveModule: (module: string) => void}> = ({setActiveModule}) => {
    const { t, language, dir } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const data = MOCK_SHARIA_KPI_DATA;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<QuickActionType | null>(null);

    const openActionModal = (action: QuickActionType) => {
        setModalAction(action);
        setIsModalOpen(true);
    };

    const zakatProgress = (data.zakatDistribution.current / data.zakatDistribution.target) * 100;

    return (
        <>
            <ActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} actionType={modalAction} />
            <div className="space-y-6 animate-fade-in" dir={dir}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                        <ShariaComplianceIcon /> {t('sidebar.sharia_compliance')}
                    </h1>
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border dark:border-slate-700/50 flex items-center justify-center">
                        <GaugeChart value={data.complianceRate} size={300} label={t('sharia.kpi.overallCompliance')} />
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <KpiCard title={t('sharia.kpi.pendingFatwas')} value={data.pendingFatwas} icon={<BookOpen size={24} />} />
                        <KpiCard title={t('sharia.kpi.contractsUnderReview')} value={data.contractsUnderReview} icon={<FileText size={24} />} />
                        <KpiCard title={t('sharia.board.title')} value={data.boardMembers} icon={<ShariaBoardIcon className="w-6 h-6"/>} subtext={t('sharia.board.members')} onClick={() => setActiveModule('sharia_board')} />
                        <KpiCard title={t('sharia.kpi.recentAlerts')} value={data.recentAlerts} icon={<AlertTriangle size={24} />} subtext={t('sharia.kpi.last24h')} />
                        <div className="sm:col-span-2 bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('sharia.kpi.zakatDistribution')}</h4>
                            <p className="text-2xl font-bold text-foreground dark:text-dark-foreground mt-2">{formatCurrency(data.zakatDistribution.current, language)}</p>
                            <p className="text-xs text-gray-400">{t('sharia.kpi.zakatTarget', { amount: formatCurrency(data.zakatDistribution.target, language) })}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700 mt-4">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${zakatProgress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                        <h3 className="font-semibold mb-4">{t('sharia.trend.title')}</h3>
                        <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_COMPLIANCE_TREND_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs><linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                                    <XAxis dataKey="name" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                                    <YAxis domain={[97, 100]} tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="compliance" stroke="#f59e0b" fill="url(#colorCompliance)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                        <h3 className="font-bold mb-4">{t('sharia.alerts.title')}</h3>
                        <div className="space-y-3">
                            {MOCK_SHARIA_ALERTS.map(alert => (
                                <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 ${alert.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.priority === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                    <p className="text-sm">{alert.text[language]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                        <h3 className="font-bold mb-4">{t('sharia.activity.title')}</h3>
                        <ul className="space-y-4">
                            {MOCK_SHARIA_ACTIVITIES.map(activity => (
                                <li key={activity.id} className="flex items-center gap-3">
                                    <span className="text-xl p-2 bg-gray-100 dark:bg-slate-800 rounded-md">{activity.icon}</span>
                                    <div className="flex-grow">
                                        <p className="text-sm">{activity.text[language]}</p>
                                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp, language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                        <h3 className="font-bold mb-4">{t('sharia.actions.title')}</h3>
                        <div className="space-y-3">
                            <button onClick={() => openActionModal('newFatwa')} className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                                <PlusCircle className="text-primary"/> <span className="font-semibold">{t('sharia.actions.newFatwa')}</span>
                            </button>
                             <button onClick={() => openActionModal('submitContract')} className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                                <PlusCircle className="text-primary"/> <span className="font-semibold">{t('sharia.actions.submitContract')}</span>
                            </button>
                             <button onClick={() => openActionModal('logZakat')} className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                                <PlusCircle className="text-primary"/> <span className="font-semibold">{t('sharia.actions.logZakat')}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ShariaCompliancePage;