import React, { useState } from 'react';
import type { IndividualDonor } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';

interface SmartAlertsProps {
    donors: IndividualDonor[];
}

type AlertType = 'ready' | 'overdue' | 'atRisk' | 'highProb';

const SmartAlerts: React.FC<SmartAlertsProps> = ({ donors }) => {
    const { t } = useLocalization();
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<AlertType>>(new Set());

    const alerts = React.useMemo(() => {
        const today = new Date();
        const todayDay = today.getDate();
        const nextThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

        const ready = donors.filter(d => d.best_contact_day_of_month === todayDay);
        const overdue = donors.filter(d => {
            if (!d.timing_updated_at || !d.contact_frequency_days) return false;
            const lastContact = new Date(d.timing_updated_at);
            const overdueDate = new Date(lastContact.getTime() + (d.contact_frequency_days * 2 * 24 * 60 * 60 * 1000));
            return overdueDate < today;
        });
        const atRisk = donors.filter(d => {
            if (!d.next_predicted_donation_date || d.donorCategory !== 'Recurring Donor') return false;
            const predDate = new Date(d.next_predicted_donation_date);
            const sevenDaysPast = new Date(predDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            return sevenDaysPast < today;
        });
        const highProb = donors.filter(d => {
            if (!d.next_predicted_donation_date || !d.engagement_score) return false;
            const predDate = new Date(d.next_predicted_donation_date);
            return d.engagement_score > 70 && predDate >= today && predDate <= nextThreeDays;
        });

        return { ready, overdue, atRisk, highProb };
    }, [donors]);

    const handleDismiss = (type: AlertType) => {
        setDismissedAlerts(prev => new Set(prev).add(type));
    };

    const Alert: React.FC<{ type: AlertType; count: number; text: string; color: string; icon: string }> = ({ type, count, text, color, icon }) => {
        if (count === 0 || dismissedAlerts.has(type)) return null;
        return (
            <div className={`p-4 rounded-lg flex items-center justify-between animate-fade-in ${color}`}>
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <p className="text-sm font-semibold">{t(text, { count })}</p>
                </div>
                <button onClick={() => handleDismiss(type)} className="p-1 rounded-full opacity-70 hover:opacity-100">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <Alert type="ready" count={alerts.ready.length} text="optimalContactTiming.alerts.ready" color="bg-green-100 text-green-800 dark:bg-green-900/40" icon="🟢" />
            <Alert type="overdue" count={alerts.overdue.length} text="optimalContactTiming.alerts.overdue" color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40" icon="🟡" />
            <Alert type="atRisk" count={alerts.atRisk.length} text="optimalContactTiming.alerts.atRisk" color="bg-red-100 text-red-800 dark:bg-red-900/40" icon="🔴" />
            <Alert type="highProb" count={alerts.highProb.length} text="optimalContactTiming.alerts.highProb" color="bg-blue-100 text-blue-800 dark:bg-blue-900/40" icon="🔵" />
        </div>
    );
};

export default SmartAlerts;
