import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useOptimalTimingData } from '../../hooks/useOptimalTimingData';
import type { Role, IndividualDonor, ContactChannel } from '../../types';
import { TimingIcon } from '../icons/ModuleIcons';
import { XIcon } from '../icons/GenericIcons';
import { Mail, MessageSquare, Phone, RefreshCw } from 'lucide-react';
import Spinner from '../common/Spinner';
import { formatDate } from '../../lib/utils';

// Localized strings to avoid touching global i18n files
const localTranslations = {
    en: {
        title: "Optimal Contact Timing",
        alerts_ready: "5 donors are ready to be contacted today based on optimal timing.",
        dashboard_predictedThisWeek: "Predicted This Week",
        dashboard_dueToday: "Due Today",
        dashboard_avgEngagement: "Avg. Engagement",
        dashboard_totalAnalyzed: "Total Analyzed",
        filters_allChannels: "All Channels",
        filters_allEngagements: "All Engagements",
        filters_allCategories: "All Categories",
        filters_readyToContact: "Ready to Contact Today",
        table_lastContact: "Last Contact",
        table_engagement: "Engagement",
        table_channel: "Channel",
        table_bestTime: "Best Time",
        table_nextDonation: "Next Predicted Donation",
        table_donor: "Donor",
        countdown_inDays: "in {count} days",
        countdown_overdueDays: "overdue by {count} days",
        countdown_today: "Today",
        preview: "Preview"
    },
    ar: {
        title: "التوقيت الأمثل للتواصل",
        alerts_ready: "5 مانحين جاهزون للتواصل معهم اليوم بناءً على التوقيت الأمثل.",
        dashboard_predictedThisWeek: "المتوقع هذا الأسبوع",
        dashboard_dueToday: "مستحق اليوم",
        dashboard_avgEngagement: "متوسط التفاعل",
        dashboard_totalAnalyzed: "إجمالي التحليلات",
        filters_allChannels: "كل القنوات",
        filters_allEngagements: "كل مستويات التفاعل",
        filters_allCategories: "كل الفئات",
        filters_readyToContact: "جاهز للتواصل اليوم",
        table_lastContact: "آخر تواصل",
        table_engagement: "التفاعل",
        table_channel: "القناة",
        table_bestTime: "أفضل وقت",
        table_nextDonation: "التبرع القادم المتوقع",
        table_donor: "المانح",
        countdown_inDays: "خلال {count} أيام",
        countdown_overdueDays: "متأخر {count} أيام",
        countdown_today: "اليوم",
        preview: "معاينة"
    },
    tr: {
        title: "Optimal İletişim Zamanlaması",
        alerts_ready: "Optimal zamanlamaya göre bugün 5 bağışçı ile iletişime geçilmeye hazır.",
        dashboard_predictedThisWeek: "Bu Hafta Tahmin Edilen",
        dashboard_dueToday: "Bugün Vadesi Gelen",
        dashboard_avgEngagement: "Ort. Etkileşim",
        dashboard_totalAnalyzed: "Toplam Analiz Edilen",
        filters_allChannels: "Tüm Kanallar",
        filters_allEngagements: "Tüm Etkileşimler",
        filters_allCategories: "Tüm Kategoriler",
        filters_readyToContact: "Bugün İletişime Hazır",
        table_lastContact: "Son İletişim",
        table_engagement: "Etkileşim",
        table_channel: "Kanal",
        table_bestTime: "En İyi Zaman",
        table_nextDonation: "Sonraki Tahmini Bağış",
        table_donor: "Bağışçı",
        countdown_inDays: "{count} gün içinde",
        countdown_overdueDays: "{count} gün gecikmiş",
        countdown_today: "Bugün",
        preview: "Ön izleme"
    },
};

// Sub-components
const channelIcons: Record<ContactChannel, React.FC<{className?: string}>> = {
  email: Mail,
  whatsapp: MessageSquare, // Using MessageSquare for whatsapp as per other components.
  sms: MessageSquare,
  call: Phone,
};

const Countdown: React.FC<{ dateString?: string }> = ({ dateString }) => {
    const { language } = useLocalization();
    const t = (key: keyof (typeof localTranslations)['en'], options?: { count: number }) => {
        let text = localTranslations[language]?.[key] || localTranslations.en[key];
        if (options && text) {
            text = text.replace('{count}', String(options.count));
        }
        return text;
    };
    
    const calculateTimeLeft = () => {
        if (!dateString) return { text: 'N/A', color: 'text-gray-500' };
        const difference = new Date(dateString).getTime() - new Date().setHours(0,0,0,0);
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        
        if (days > 0) return { text: t('countdown_inDays', { count: days }), color: 'text-green-600' };
        if (days === 0) return { text: t('countdown_today'), color: 'text-blue-500 font-bold' };
        
        const overdueDays = Math.abs(days);
        return { text: t('countdown_overdueDays', { count: overdueDays }), color: 'text-red-500' };
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
        return () => clearInterval(timer);
    }, [dateString, language]);

    return <span className={`text-xs font-semibold ${timeLeft.color}`}>{timeLeft.text}</span>;
};

const EngagementScoreBar: React.FC<{ score?: number }> = ({ score = 0 }) => {
    const getScoreColor = (s: number): string => {
        if (s > 60) return 'bg-green-500';
        if (s > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className={`${getScoreColor(score)} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    );
};

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 text-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-foreground dark:text-dark-foreground mt-2">{value}</p>
    </div>
);


// Main Component
const OptimalContactTimingPage: React.FC<{ role: Role }> = ({ role }) => {
    const { language } = useLocalization();
    const { donors, isLoading } = useOptimalTimingData();

    // Local translation function
    const t = (key: keyof (typeof localTranslations)['en']) => {
        return localTranslations[language]?.[key] || localTranslations.en[key];
    };
    
    const [showAlert, setShowAlert] = useState(true);

    const stats = useMemo(() => {
        const analyzedDonors = donors.filter(d => d.timing_updated_at);
        const avgEngagement = analyzedDonors.reduce((sum, d) => sum + (d.engagement_score || 0), 0) / (analyzedDonors.length || 1);
        const today = new Date().getDate();
        const dueToday = analyzedDonors.filter(d => d.best_contact_day_of_month === today).length;
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const predictedThisWeek = analyzedDonors.filter(d => {
            if (!d.next_predicted_donation_date) return false;
            const predDate = new Date(d.next_predicted_donation_date);
            return predDate >= now && predDate <= nextWeek;
        }).length;

        return {
            totalAnalyzed: analyzedDonors.length,
            avgEngagement,
            dueToday,
            predictedThisWeek,
        };
    }, [donors]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner text="Analyzing donor data..." /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <TimingIcon /> {t('title')}
                </h1>
                <button><RefreshCw className="w-6 h-6 text-gray-500" /></button>
            </div>
            
            {showAlert && (
                 <div className="p-4 rounded-lg flex items-center justify-between bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <p className="text-sm font-semibold">{t('alerts_ready')}</p>
                    </div>
                    <button onClick={() => setShowAlert(false)} className="p-1 rounded-full opacity-70 hover:opacity-100">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KpiCard title={t('dashboard_predictedThisWeek')} value={stats.predictedThisWeek} />
                 <KpiCard title={t('dashboard_dueToday')} value={stats.dueToday} />
                 <KpiCard title={t('dashboard_avgEngagement')} value={`${Math.round(stats.avgEngagement)}/100`} />
                 <KpiCard title={t('dashboard_totalAnalyzed')} value={stats.totalAnalyzed} />
            </div>

            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
                <div className="p-4 border-b dark:border-slate-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                            <option>{t('filters_allChannels')}</option>
                        </select>
                        <select className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                             <option>{t('filters_allEngagements')}</option>
                        </select>
                        <select className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                            <option>{t('filters_allCategories')}</option>
                        </select>
                        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                            <input type="checkbox" id="readyToContact" className="w-4 h-4 text-primary rounded" />
                            <label htmlFor="readyToContact" className="text-sm font-medium">{t('filters_readyToContact')}</label>
                        </div>
                    </div>
                </div>
                
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                             <tr>
                                <th scope="col" className="px-4 py-3">{t('table_donor')}</th>
                                <th scope="col" className="px-4 py-3">{t('table_nextDonation')}</th>
                                <th scope="col" className="px-4 py-3">{t('table_bestTime')}</th>
                                <th scope="col" className="px-4 py-3">{t('table_channel')}</th>
                                <th scope="col" className="px-4 py-3">{t('table_engagement')}</th>
                                <th scope="col" className="px-4 py-3">{t('table_lastContact')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donors.slice(0, 7).map(donor => {
                                const ChannelIcon = donor.preferred_contact_channel ? channelIcons[donor.preferred_contact_channel] : null;
                                return (
                                    <tr key={donor.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                        <td className="px-4 py-3 font-bold text-foreground dark:text-dark-foreground">{donor.fullName[language]}</td>
                                        <td className="px-4 py-3">
                                            <div>{donor.next_predicted_donation_date ? formatDate(donor.next_predicted_donation_date, language) : 'N/A'}</div>
                                            <Countdown dateString={donor.next_predicted_donation_date} />
                                        </td>
                                        <td className="px-4 py-3 text-xs">{donor.best_contact_time || 'N/A'} ({donor.best_contact_day_of_week})</td>
                                        <td className="px-4 py-3 capitalize">{ChannelIcon && <ChannelIcon className="w-5 h-5"/>}</td>
                                        <td className="px-4 py-3"><EngagementScoreBar score={donor.engagement_score} /></td>
                                        <td className="px-4 py-3">{donor.lastDonationDate ? formatDate(donor.lastDonationDate, language) : 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-start">
                <button className="px-4 py-2 text-sm font-semibold border rounded-lg bg-card dark:bg-dark-card dark:border-slate-600">{t('preview')}</button>
            </div>
        </div>
    );
};

export default OptimalContactTimingPage;