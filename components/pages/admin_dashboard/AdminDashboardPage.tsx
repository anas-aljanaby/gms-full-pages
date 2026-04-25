
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';
import { useTheme } from '../../hooks/useTheme';
import { MOCK_ADMIN_DATA } from '../../data/adminDashboardData';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { AdminDashboardIcon } from '../icons/ModuleIcons';
import { ArrowUp, ArrowDown, RefreshCw, Download, FileText, Printer, Mail, Star, Users, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useCountUp } from '../../hooks/useCountUp';
import html2canvas from 'html2canvas';
import ParticipantsTable from './admin_dashboard/ParticipantsTable';
import ExportMenu from '../dashboard/ExportMenu';
import ShareMenu from '../dashboard/ShareMenu';

// --- SUB-COMPONENTS ---

const StarRating: React.FC<{ rating: number; maxRating?: number }> = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => (
        <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.175 0l-3.368 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  );
};

const KpiCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-slate-700/50"
    >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
                {children}
            </div>
        </div>
    </motion.div>
);

const AdminDashboardPage: React.FC = () => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [data, setData] = useState(MOCK_ADMIN_DATA);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);

    // Live registration simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({ ...prev, totalRegistrations: { ...prev.totalRegistrations, value: prev.totalRegistrations.value + 1 } }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setData(MOCK_ADMIN_DATA);
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 1000);
    };
    
    const animatedRegistrations = useCountUp(data.totalRegistrations.value);
    const animatedAttendees = useCountUp(data.totalAttendees.value);

    return (
        <div className="space-y-6 animate-fade-in printable-dashboard" ref={dashboardRef}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hide-on-print">
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                        <AdminDashboardIcon /> {t('sidebar.admin_dashboard')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('admin_dashboard.last_updated')}: {lastUpdated.toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRefresh} className={`p-2 rounded-lg border dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 ${isRefreshing ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <ShareMenu dashboardId="admin-dashboard" />
                    <ExportMenu dashboardRef={dashboardRef} filename="admin-dashboard-report" participantData={data.participants} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard icon={<Users className="w-6 h-6" />} title={t('admin_dashboard.total_registrations')}>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{formatNumber(animatedRegistrations, language)}</p>
                        <span className={`flex items-center text-sm font-semibold ${data.totalRegistrations.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.totalRegistrations.trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {Math.abs(data.totalRegistrations.trend)}%
                        </span>
                    </div>
                </KpiCard>
                <KpiCard icon={<Users className="w-6 h-6" />} title={t('admin_dashboard.total_attendees')}>
                    <p className="text-2xl font-bold">{formatNumber(animatedAttendees, language)} <span className="text-base font-medium text-gray-500">({((data.totalAttendees.value / data.totalAttendees.total) * 100).toFixed(0)}%)</span></p>
                </KpiCard>
                <KpiCard icon={<Star className="w-6 h-6" />} title={t('admin_dashboard.average_rating')}>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{data.averageRating.value.toFixed(1)}</p>
                        <StarRating rating={data.averageRating.value} />
                    </div>
                </KpiCard>
                <KpiCard icon={<DollarSign className="w-6 h-6" />} title={t('admin_dashboard.budget_utilization')}>
                    <p className="text-2xl font-bold">{formatCurrency(data.budgetUtilization.used, language)}</p>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(data.budgetUtilization.used / data.budgetUtilization.total) * 100}%` }}></div>
                    </div>
                </KpiCard>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-semibold mb-4">{t('admin_dashboard.attendance_over_time')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.attendanceOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                            <XAxis dataKey="date" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <YAxis tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value: unknown) => {
                                const numericValue = Number(value);
                                if (isNaN(numericValue)) {
                                    return String(value);
                                }
                                return formatNumber(numericValue, language);
                            }} />
                            <Legend />
                            <Line type="monotone" dataKey="attendees" name={t('admin_dashboard.attendees')} stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-semibold mb-4">{t('admin_dashboard.reg_vs_att')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.registrationVsAttendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                            <XAxis dataKey="event" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <YAxis tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value: unknown) => {
                                const numericValue = Number(value);
                                if (isNaN(numericValue)) {
                                    return String(value);
                                }
                                return formatNumber(numericValue, language);
                            }} />
                            <Legend />
                            <Bar dataKey="registrations" name={t('admin_dashboard.registrations')} fill="#8884d8" />
                            <Bar dataKey="attendees" name={t('admin_dashboard.attendees')} fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-semibold mb-4">{t('admin_dashboard.event_type_dist')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.eventTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {data.eventTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />)}
                            </Pie>
                            <Tooltip formatter={(value: unknown) => {
                                const numericValue = Number(value);
                                if (isNaN(numericValue)) {
                                    return String(value);
                                }
                                return formatNumber(numericValue, language);
                            }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-semibold mb-4">{t('admin_dashboard.rating_dist')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.ratingDistribution} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                            <XAxis type="number" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <YAxis type="category" dataKey="rating" tickFormatter={(val) => `${val} ★`} tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value: unknown) => {
                                const numericValue = Number(value);
                                if (isNaN(numericValue)) {
                                    return [String(value), 'Count'];
                                }
                                return [formatNumber(numericValue, language), 'Count'];
                            }} />
                            <Bar dataKey="count" name="Count" fill="#ffc658" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Participants Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
                 <ParticipantsTable participants={data.participants} />
            </motion.div>
        </div>
    );
};

export default AdminDashboardPage;