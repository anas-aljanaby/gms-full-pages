import React, { useState, useEffect } from 'react';
import type { IndividualDonor, DonorCategory, EngagementScoreLevel, ContactChannel } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatDate, formatCurrency, formatNumber } from '../../../lib/utils';
import { channelIcons } from '../../icons/ChannelIcons';

// --- SUB-COMPONENTS ---

const Countdown: React.FC<{ dateString?: string }> = ({ dateString }) => {
    const { t } = useLocalization();
    const calculateTimeLeft = () => {
        if (!dateString) return { text: 'N/A', color: 'text-gray-500' };
        const difference = new Date(dateString).getTime() - new Date().getTime();
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        
        if (days > 0) return { text: t('optimalContactTiming.table.countdown.inDays', { count: days }), color: 'text-green-600' };
        if (days === 0) return { text: t('optimalContactTiming.table.countdown.today'), color: 'text-blue-500 font-bold' };
        
        const overdueDays = Math.abs(days);
        if (overdueDays <= 7) return { text: t('optimalContactTiming.table.countdown.overdueDays', { count: overdueDays }), color: 'text-yellow-500' };
        return { text: t('optimalContactTiming.table.countdown.overdueDays', { count: overdueDays }), color: 'text-red-500' };
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, [dateString]);

    return <span className={`text-xs font-semibold ${timeLeft.color}`}>{timeLeft.text}</span>;
};

const EngagementScoreBar: React.FC<{ score?: number }> = ({ score = 0 }) => {
    const getScoreColor = (s: number): string => {
        if (s > 60) return 'bg-green-500';
        if (s > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    );
};

// --- MAIN TABLE COMPONENT ---

interface TimingTableProps {
    donors: IndividualDonor[];
    filters: any;
    setFilters: (filters: any) => void;
    onContactNow: (donor: IndividualDonor) => void;
}

const TimingTable: React.FC<TimingTableProps> = ({ donors, filters, setFilters, onContactNow }) => {
    const { t, language } = useLocalization();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;
    
    const paginatedDonors = donors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(donors.length / rowsPerPage);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFilters((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            {/* Filter Bar */}
            <div className="p-4 border-b dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2 col-span-2 md:col-span-4 lg:col-span-1">
                        <input type="checkbox" id="readyToContact" name="readyToContact" checked={filters.readyToContact} onChange={handleFilterChange} className="w-4 h-4 text-primary rounded" />
                        <label htmlFor="readyToContact" className="text-sm font-medium">{t('optimalContactTiming.filters.readyToContact')}</label>
                    </div>
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                        <option value="all">{t('optimalContactTiming.filters.allCategories')}</option>
                    </select>
                     <select name="engagement" value={filters.engagement} onChange={handleFilterChange} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                        <option value="all">{t('optimalContactTiming.filters.allEngagements')}</option>
                        <option value="High">{t('optimalContactTiming.filters.high')}</option>
                        <option value="Medium">{t('optimalContactTiming.filters.medium')}</option>
                        <option value="Low">{t('optimalContactTiming.filters.low')}</option>
                    </select>
                     <select name="channel" value={filters.channel} onChange={handleFilterChange} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                        <option value="all">{t('optimalContactTiming.filters.allChannels')}</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="call">Call</option>
                    </select>
                </div>
            </div>

            {/* Table */}
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.donor')}</th>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.nextDonation')}</th>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.bestTime')}</th>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.channel')}</th>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.engagement')}</th>
                            <th scope="col" className="px-4 py-3">{t('optimalContactTiming.table.lastContact')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('optimalContactTiming.table.actions')}</th>
                        </tr>
                    </thead>
                     <tbody>
                        {paginatedDonors.map(donor => {
                            const ChannelIcon = donor.preferred_contact_channel ? channelIcons[donor.preferred_contact_channel] : null;
                            return (
                                <tr key={donor.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                    <td className="px-4 py-3 font-bold text-foreground dark:text-dark-foreground">{donor.fullName[language]}</td>
                                    <td className="px-4 py-3">
                                        <div>{donor.next_predicted_donation_date ? formatDate(donor.next_predicted_donation_date, language) : 'N/A'}</div>
                                        <Countdown dateString={donor.next_predicted_donation_date} />
                                    </td>
                                    <td className="px-4 py-3 text-xs">{donor.best_contact_time || 'N/A'} ({donor.best_contact_day_of_week})</td>
                                    <td className="px-4 py-3 capitalize">{ChannelIcon && <ChannelIcon />}</td>
                                    <td className="px-4 py-3"><EngagementScoreBar score={donor.engagement_score} /></td>
                                    <td className="px-4 py-3">{donor.timing_updated_at ? formatDate(donor.timing_updated_at, language) : 'N/A'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => onContactNow(donor)} className="px-3 py-1 text-xs font-semibold text-white bg-secondary rounded-md">{t('optimalContactTiming.actions.contactNow')}</button>
                                            <button className="px-3 py-1 text-xs font-semibold border rounded-md dark:border-slate-600">{t('optimalContactTiming.actions.schedule')}</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
             </div>
             {/* Pagination controls can be added here */}
        </div>
    );
};

export default TimingTable;