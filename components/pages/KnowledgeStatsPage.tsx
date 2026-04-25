import React, { useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { KnowledgeIcon } from '../icons/ModuleIcons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatNumber } from '../../lib/utils';
import { FileText, Users, Eye, Star } from 'lucide-react';
import type { Language } from '../../types';
import { useKnowledgeData } from '../../hooks/useKnowledgeData';
import Spinner from '../common/Spinner';

// Local translations to avoid modifying global i1n files
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: 'إحصائيات مكتبة المعرفة',
        totalContent: 'إجمالي المحتوى',
        activeContributors: 'مساهمون نشطون',
        totalViews: 'إجمالي المشاهدات',
        pointsDistributed: 'نقاط موزعة',
        monthlyActivity: 'النشاط الشهري',
    },
    en: {
        title: 'Knowledge Library Statistics',
        totalContent: 'Total Content',
        activeContributors: 'Active Contributors',
        totalViews: 'Total Views',
        pointsDistributed: 'Points Distributed',
        monthlyActivity: 'Monthly Activity',
    },
    tr: {
        title: 'Bilgi Kütüphanesi İstatistikleri',
        totalContent: 'Toplam İçerik',
        activeContributors: 'Aktif Katkıda Bulunanlar',
        totalViews: 'Toplam Görüntüleme',
        pointsDistributed: 'Dağıtılan Puanlar',
        monthlyActivity: 'Aylık Aktivite',
    },
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
            </div>
        </div>
    );
};

const KnowledgeStatsPage: React.FC = () => {
  const { language } = useLocalization();
  const { theme } = useTheme();
  const { knowledgeData, isLoading } = useKnowledgeData();
  const isDark = theme === 'dark';
  
  const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

  const stats = useMemo(() => {
    if (!knowledgeData) return { totalContent: 0, activeContributors: 0, totalViews: 0, totalPoints: 0 };
    
    const totalContent = knowledgeData.articles.length;
    const activeContributors = knowledgeData.points.length;
    const totalViews = knowledgeData.articles.reduce((sum, article) => sum + article.views, 0);
    const totalPoints = knowledgeData.points.reduce((sum, user) => sum + user.total_points, 0);

    return { totalContent, activeContributors, totalViews, totalPoints };
  }, [knowledgeData]);

  const chartData = [
    { name: 'Jan', activity: 40 },
    { name: 'Feb', activity: 30 },
    { name: 'Mar', activity: 50 },
    { name: 'Apr', activity: 45 },
    { name: 'May', activity: 60 },
    { name: 'Jun', activity: 55 },
    { name: 'Jul', activity: 70 },
  ];

  if (isLoading) {
      return <div className="flex h-full w-full items-center justify-center"><Spinner text="Loading stats..." /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
            <KnowledgeIcon className="w-8 h-8 text-primary dark:text-secondary"/>
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                {t('title')}
            </h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={t('totalContent')} value={formatNumber(stats.totalContent, language)} icon={<FileText className="text-blue-600"/>} color="bg-blue-100 dark:bg-blue-900/20" />
            <StatCard title={t('activeContributors')} value={formatNumber(stats.activeContributors, language)} icon={<Users className="text-green-600"/>} color="bg-green-100 dark:bg-green-900/20" />
            <StatCard title={t('totalViews')} value={formatNumber(stats.totalViews, language)} icon={<Eye className="text-indigo-600"/>} color="bg-indigo-100 dark:bg-indigo-900/20" />
            <StatCard title={t('pointsDistributed')} value={formatNumber(stats.totalPoints, language)} icon={<Star className="text-yellow-600"/>} color="bg-yellow-100 dark:bg-yellow-900/20" />
        </div>

        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
            <h2 className="text-xl font-bold mb-4">{t('monthlyActivity')}</h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#4A5568" : "#E2E8F0"} />
                        <XAxis dataKey="name" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                        <YAxis tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: isDark ? '#1A202C' : '#FFFFFF', 
                                border: `1px solid ${isDark ? '#4A5568' : '#E2E8F0'}`
                            }}
                            formatter={(value: number) => [formatNumber(value, language), 'Activity']}
                        />
                        <Bar dataKey="activity" fill="hsl(210, 40%, 50%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};
export default KnowledgeStatsPage;