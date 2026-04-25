import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber } from '../../../lib/utils';
import type { HrData } from '../../../types';
import { UsersIcon, ClockIcon, StarIcon } from '../../icons/HrIcons';

interface HrDashboardProps {
    hrData: HrData;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft flex items-center gap-4">
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-full">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
        </div>
    </div>
);

const QuickActionButton: React.FC<{ label: string; }> = ({ label }) => (
    <button className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50 font-semibold text-sm transition-colors">
        {label}
    </button>
);

const HrDashboard: React.FC<HrDashboardProps> = ({ hrData }) => {
    const { t, language } = useLocalization();

    const stats = React.useMemo(() => {
        const activeVolunteers = hrData.volunteers.filter(v => v.status === 'active' && v.volunteer_type === 'volunteer').length;
        const staffMembers = hrData.volunteers.filter(v => v.volunteer_type === 'staff').length;
        const totalSkills = hrData.skills.length;
        const availableNow = hrData.availability.filter(a => {
            const now = new Date();
            const day = now.toLocaleString('en-US', { weekday: 'long' }) as any;
            const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            return a.day_of_week === day && a.available && time >= a.start_time && time <= a.end_time;
        }).length;

        return { activeVolunteers, staffMembers, totalSkills, availableNow };
    }, [hrData]);

    const animatedVolunteers = useCountUp(stats.activeVolunteers);
    const animatedStaff = useCountUp(stats.staffMembers);
    const animatedSkills = useCountUp(stats.totalSkills);
    const animatedAvailable = useCountUp(stats.availableNow);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <KpiCard title={t('hr_dashboard.activeVolunteers')} value={formatNumber(animatedVolunteers, language)} icon={<UsersIcon />} />
                    <KpiCard title={t('hr_dashboard.staffMembers')} value={formatNumber(animatedStaff, language)} icon={<UsersIcon />} />
                    <KpiCard title={t('hr_dashboard.registeredSkills')} value={formatNumber(animatedSkills, language)} icon={<StarIcon />} />
                    <KpiCard title={t('hr_dashboard.availableNow')} value={formatNumber(animatedAvailable, language)} icon={<ClockIcon />} />
                </div>
                {/* More complex charts like 'Hours by Program' or 'Volunteer Performance Distribution' would go here */}
                 <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                     <h3 className="font-bold mb-4">{t('hr_dashboard.performanceOverview')}</h3>
                     <div className="h-48 flex items-center justify-center text-gray-400">{t('hr_dashboard.chartPlaceholder')}</div>
                 </div>
            </div>
            <div className="lg:col-span-1 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                <h3 className="font-bold mb-4">{t('hr_dashboard.quickActions')}</h3>
                <div className="space-y-3">
                    <QuickActionButton label={t('hr_dashboard.addNewVolunteer')} />
                    <QuickActionButton label={t('hr_dashboard.importFromExcel')} />
                    <QuickActionButton label={t('hr_dashboard.exportData')} />
                    <QuickActionButton label={t('hr_dashboard.createReport')} />
                </div>
            </div>
        </div>
    );
};

export default HrDashboard;