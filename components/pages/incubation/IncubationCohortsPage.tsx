
import React from 'react';
import type { IncubationData, Cohort } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatDate, formatNumber } from '../../../lib/utils';
import { Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface IncubationCohortsPageProps {
  incubationData: IncubationData;
}

const CohortCard: React.FC<{ cohort: Cohort; founderCount: number }> = ({ cohort, founderCount }) => {
    const { t, language } = useLocalization();
    const statusClasses: Record<Cohort['status'], string> = {
        recruiting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'in-progress': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        completed: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300',
    };

    const dateOptions: Intl.DateTimeFormatOptions = language === 'ar'
        ? { day: 'numeric', month: 'long', year: 'numeric', calendar: 'islamic' }
        : { day: 'numeric', month: 'long', year: 'numeric' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all"
        >
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-foreground dark:text-dark-foreground">{cohort.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[cohort.status]}`}>
                        {t(`incubation.statuses.${cohort.status.replace('-', '')}`)}
                    </span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2"><Calendar size={16} /> <span>{formatDate(cohort.startDate, language, dateOptions)} - {formatDate(cohort.endDate, language, dateOptions)}</span></p>
                    <p className="flex items-center gap-2"><Users size={16} /> <span>{t('incubation.cohorts.founders')} {formatNumber(founderCount, language)}</span></p>
                </div>
            </div>
            <button className="mt-6 w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                {t('incubation.cohorts.viewDetails')}
            </button>
        </motion.div>
    );
};

const IncubationCohortsPage: React.FC<IncubationCohortsPageProps> = ({ incubationData }) => {
    const { t, dir } = useLocalization();
    const { cohorts, startups } = incubationData;

    return (
        <div className="space-y-6 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold">{t('incubation.cohorts.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cohorts.map(cohort => {
                    const founderCount = startups.filter(s => s.cohortId === cohort.id).length;
                    return <CohortCard key={cohort.id} cohort={cohort} founderCount={founderCount} />;
                })}
            </div>
        </div>
    );
};

export default IncubationCohortsPage;
