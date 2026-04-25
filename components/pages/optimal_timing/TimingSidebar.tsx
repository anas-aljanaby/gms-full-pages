import React, { useState } from 'react';
import type { IndividualDonor } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatDate } from '../../../lib/utils';

interface TimingSidebarProps {
    donors: IndividualDonor[];
}

const TimingSidebar: React.FC<TimingSidebarProps> = ({ donors }) => {
    const { t, language } = useLocalization();
    const [currentDate, setCurrentDate] = useState(new Date());

    const donationsByDate = React.useMemo(() => {
        const map = new Map<string, number>();
        donors.forEach(d => {
            if (d.next_predicted_donation_date) {
                const dateKey = new Date(d.next_predicted_donation_date).toISOString().split('T')[0];
                map.set(dateKey, (map.get(dateKey) || 0) + 1);
            }
        });
        return map;
    }, [donors]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const day = new Date(startOfMonth);
        day.setDate(startOfMonth.getDate() - startOfMonth.getDay() + i);
        return day;
    });

    const dayNames = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(2023, 0, i + 1);
        return day.toLocaleDateString(language, { weekday: 'short' });
    });

    const urgentContacts = donors.filter(d => d.donorCategory === 'Dormant Donor' && d.engagement_score && d.engagement_score < 30).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft p-4 border dark:border-slate-700/50">
                <h3 className="font-bold text-center mb-2">{t('optimalContactTiming.sidebar.predictedDonations')}</h3>
                 <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
                    {dayNames.map(d => <div key={d}>{d}</div>)}
                </div>
                 <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(day => {
                        const dateKey = day.toISOString().split('T')[0];
                        const count = donationsByDate.get(dateKey);
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div key={dateKey} className={`relative h-10 flex items-center justify-center text-sm rounded-lg ${isToday ? 'bg-primary text-white font-bold' : isCurrentMonth ? '' : 'text-gray-400'}`}>
                                {day.getDate()}
                                {count && <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-secondary text-white rounded-full flex items-center justify-center">{count}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

             <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft p-4 border dark:border-slate-700/50">
                <h3 className="font-bold mb-2">{t('optimalContactTiming.sidebar.urgentContacts')}</h3>
                <ul className="space-y-3">
                    {urgentContacts.map(d => (
                        <li key={d.id} className="flex items-center gap-3">
                            <img src={d.avatar} alt={d.fullName.en} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="text-sm font-semibold">{d.fullName[language]}</p>
                                <p className="text-xs text-red-500">{t(`donorIntelligence.categories.${d.donorCategory?.replace(' ', '')}`)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TimingSidebar;
