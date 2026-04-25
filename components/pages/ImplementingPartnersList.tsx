

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, List, LayoutGrid, Users, Building2, DollarSign, Star } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import { MOCK_PARTNERS } from '../../data/partnersData';
import PartnerCard from './partners/PartnerCard';
import type { Partner, PartnerSector, PartnerStatus } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/utils';
import PartnerProfilePage from './partners/PartnerProfilePage';
import AddPartnerPage from './partners/AddPartnerPage';
import EmptyState from '../common/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { useCountUp } from '../../hooks/useCountUp';
import { useToast } from '../../hooks/useToast';
import { MicrophoneIcon } from '../icons/AiIcons';


interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition; };
        webkitSpeechRecognition: { new(): SpeechRecognition; };
    }
}


const SkeletonCard = () => (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto mt-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md mt-3 w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md mt-2 w-1/2 mx-auto"></div>
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 w-1/4 mx-auto"></div>
        <div className="mt-4 pt-4 border-t dark:border-slate-600 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div className="mt-4 w-full h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
    </div>
);

const PartnerKpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; format?: 'number' | 'currency' | 'rating'; colorClass: string }> = ({ title, value, icon, format = 'number', colorClass }) => {
    const { language } = useLocalization();
    const animatedValue = useCountUp(value, 1500);

    const formattedValue = () => {
        switch(format) {
            case 'currency':
                return formatCurrency(animatedValue, language);
            case 'rating':
                return animatedValue.toFixed(1);
            case 'number':
            default:
                return formatNumber(Math.round(animatedValue), language);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border dark:border-slate-700 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-gray-800 dark:text-dark-foreground">{formattedValue()}</p>
            </div>
        </div>
    );
};

const SmartAnalyticsDashboard: React.FC<{ partners: Partner[] }> = ({ partners }) => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const stats = useMemo(() => {
        const totalPartners = partners.length;
        const activePartners = partners.filter(p => p.status === 'نشط').length;
        const totalBudget = partners.reduce((sum, p) => sum + p.budget, 0);
        const avgRating = totalPartners > 0 ? partners.reduce((sum, p) => sum + p.rating, 0) / totalPartners : 0;
        
        const partnersBySector = partners.reduce((acc, p) => {
            acc[p.sector] = (acc[p.sector] || 0) + 1;
            return acc;
        }, {} as Record<PartnerSector, number>);
        
        return { totalPartners, activePartners, totalBudget, avgRating, partnersBySector };
    }, [partners]);

    const chartData = Object.entries(stats.partnersBySector).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow p-6 mb-6 border dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-foreground mb-4">نظرة عامة تحليلية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <PartnerKpiCard title="إجمالي الشركاء" value={stats.totalPartners} icon={<Users />} colorClass="bg-blue-100 text-blue-600" />
                <PartnerKpiCard title="الشركاء النشطون" value={stats.activePartners} icon={<Building2 />} colorClass="bg-green-100 text-green-600" />
                <PartnerKpiCard title="إجمالي الميزانيات" value={stats.totalBudget} icon={<DollarSign />} format="currency" colorClass="bg-purple-100 text-purple-600" />
                <PartnerKpiCard title="متوسط التقييم" value={stats.avgRating} icon={<Star />} format="rating" colorClass="bg-yellow-100 text-yellow-600" />
            </div>
            <div>
                <h3 className="font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">توزيع الشركاء حسب القطاع</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                        <XAxis dataKey="name" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568', fontSize: 12 }} />
                        <YAxis tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: isDark ? '#1A202C' : '#FFFFFF', border: `1px solid ${isDark ? '#4A5568' : '#E2E8F0'}`, direction: 'rtl' }}
                            formatter={(value: number) => [formatNumber(value, language), 'شركاء']}
                        />
                        <Bar dataKey="value" name="عدد الشركاء">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const ImplementingPartnersList: React.FC = () => {
    const { t, language } = useLocalization();

    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [pageState, setPageState] = useState<'list' | 'add' | 'profile'>('list');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        sector: 'الكل',
        status: 'الكل',
        region: 'الكل',
        rating: 'الكل',
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    // Voice Search State
    const toast = useToast();
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setMicError("Speech recognition is not supported in this browser.");
            return;
        }
        
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                const errorMsg = "Microphone permission was denied. Please enable it in your browser settings.";
                setMicError(errorMsg);
                toast.showError(errorMsg);
            }
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setSearchTerm(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [toast, language]);

    const handleListen = useCallback(() => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            return;
        }
        setMicError(null);
        const langCode = { en: 'en-US', ar: 'ar-SA', tr: 'tr-TR' }[language];
        recognitionRef.current.lang = langCode;
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Speech recognition start error:", e);
            const errorMsg = "Could not start listening. Please try again.";
            setMicError(errorMsg);
            toast.showError(errorMsg);
        }
    }, [isListening, language, toast]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setPartners(MOCK_PARTNERS);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    
    const sectors: PartnerSector[] = ['التعليم', 'الصحة', 'الإغاثة', 'التنمية', 'البيئة'];
    const statuses: PartnerStatus[] = ['نشط', 'غير نشط', 'قيد المراجعة'];
    const regions = ['أفريقيا', 'آسيا', 'الشرق الأوسط', 'أوروبا', 'أمريكا'];

    const filteredPartners = useMemo(() => {
        return partners.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(searchLower) || p.country.toLowerCase().includes(searchLower) || p.sector.toLowerCase().includes(searchLower);
            const matchesSector = filters.sector === 'الكل' || p.sector === filters.sector;
            const matchesStatus = filters.status === 'الكل' || p.status === filters.status;
            return matchesSearch && matchesSector && matchesStatus;
        });
    }, [partners, searchTerm, filters]);
    
    const paginatedPartners = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPartners.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPartners, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const handlePartnerSelect = (partner: Partner) => {
        setSelectedPartner(partner);
        setPageState('profile');
    };

    const handleBackToList = () => {
        setSelectedPartner(null);
        setPageState('list');
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({
            sector: 'الكل',
            status: 'الكل',
            region: 'الكل',
            rating: 'الكل',
        });
        setCurrentPage(1);
    };

    if (pageState === 'profile' && selectedPartner) {
        return <PartnerProfilePage partner={selectedPartner} onBack={handleBackToList} />;
    }

    if (pageState === 'add') {
        return <AddPartnerPage onBack={handleBackToList} />;
    }

    return (
        <div className="bg-gray-50 dark:bg-dark-background p-6 space-y-6">
            <div>
                <nav className="text-sm mb-2 text-gray-500 dark:text-gray-400">
                    <a href="#" className="hover:underline">الرئيسية</a> &gt; 
                    <a href="#" className="hover:underline"> الشركاء</a> &gt; 
                    <span className="font-semibold text-gray-700 dark:text-gray-300"> قائمة الشركاء</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-foreground">قائمة الشركاء المنفذين</h1>
            </div>
            
            {!loading && <SmartAnalyticsDashboard partners={partners} />}

            <div className="bg-white dark:bg-dark-card rounded-xl shadow p-4 space-y-4">
                 <div className="relative">
                    <Search className="w-5 h-5 absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={isListening ? "جاري الاستماع..." : "ابحث عن شريك بالاسم، الدولة، أو القطاع..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pr-10 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition dark:bg-slate-800 dark:border-slate-600"
                    />
                     <div className="absolute inset-y-0 left-3 flex items-center">
                        <button
                            onClick={handleListen}
                            disabled={!!micError}
                            title={micError || "Search by voice"}
                            className={`p-2 rounded-full transition-colors disabled:text-gray-400 disabled:cursor-not-allowed ${
                                isListening
                                    ? 'text-red-500 bg-red-100 dark:bg-red-900/50 animate-pulse'
                                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex flex-wrap gap-2 items-center">
                        <FilterDropdown label="القطاع" options={['الكل', ...sectors]} value={filters.sector} onChange={(v) => handleFilterChange('sector', v)} />
                        <FilterDropdown label="الحالة" options={['الكل', ...statuses]} value={filters.status} onChange={(v) => handleFilterChange('status', v)} />
                        <FilterDropdown label="المنطقة" options={['الكل', ...regions]} value={filters.region} onChange={(v) => handleFilterChange('region', v)} />
                        <FilterDropdown label="التقييم" options={['الكل', '5 نجوم', '4+ نجوم', '3+ نجوم']} value={filters.rating} onChange={(v) => handleFilterChange('rating', v)} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">تصدير القائمة</button>
                        <button onClick={() => setPageState('add')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">إضافة شريك جديد</button>
                        <div className="p-1 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center">
                            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><LayoutGrid /></button>
                            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><List /></button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filteredPartners.length === 0 ? (
                <EmptyState type="NoResults" onAction={handleClearFilters} />
            ) : (
                <AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedPartners.map(partner => <PartnerCard key={partner.id} partner={partner} onClick={() => handlePartnerSelect(partner)} />)}
                    </div>
                </AnimatePresence>
            )}

            {!loading && filteredPartners.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">عرض {formatNumber((currentPage - 1) * itemsPerPage + 1, language)}-{formatNumber(Math.min(currentPage * itemsPerPage, filteredPartners.length), language)} من {formatNumber(filteredPartners.length, language)} شريك</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700">السابق</button>
                        {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-md ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{p}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700">التالي</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const FilterDropdown: React.FC<{label: string, options: string[], value: string, onChange: (value: string) => void}> = ({label, options, value, onChange}) => {
    return (
        <select onChange={(e) => onChange(e.target.value)} value={value} className="p-2 border rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
            <option value="الكل">{label}: الكل</option>
            {options.slice(1).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    )
}

export default ImplementingPartnersList;