
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useCountUp } from '../../hooks/useCountUp';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { OrphanageIcon } from '../icons/ModuleIcons';
import { Building2, Users, PieChart, DollarSign, Search, List, LayoutGrid, Plus } from 'lucide-react';
import { MOCK_ORPHANAGES } from '../../data/orphanageData';
import type { Orphanage, OrphanageStatus, Language } from '../../types';
import OrphanageCard from './orphanages/OrphanageCard';
import OrphanageTable from './orphanages/OrphanageTable';
import AddOrphanageModal from './orphanages/AddOrphanageModal';
import { useToast } from '../../hooks/useToast';

// Local translation object to respect the constraint of not modifying global i18n files.
const localTranslations: Record<Language, Record<string, string>> = {
    en: {
        title: "Orphanage Management",
        kpiTotal: "Total Orphanages",
        kpiBeneficiaries: "Total Beneficiaries",
        kpiOccupancy: "Avg. Occupancy",
        kpiBudget: "Total Budget",
        search: "Search by name or city...",
        add: "Add Orphanage",
        all_countries: "All Countries",
        all_statuses: "All Statuses",
        beneficiaries: "Beneficiaries",
        occupancy: "Occupancy",
        manager: "Manager",
        view_details: "View Details",
        capacity: "Capacity",
        name: "Name",
        location: "Location",
        status: "Status",
        budget: "Annual Budget",
        Active: "Active",
        UnderReview: "Under Review",
        Inactive: "Inactive",
    },
    ar: {
        title: "إدارة دور الأيتام",
        kpiTotal: "إجمالي دور الأيتام",
        kpiBeneficiaries: "إجمالي المستفيدين",
        kpiOccupancy: "متوسط الإشغال",
        kpiBudget: "إجمالي الميزانية",
        search: "ابحث بالاسم أو المدينة...",
        add: "إضافة دار أيتام",
        all_countries: "كل الدول",
        all_statuses: "كل الحالات",
        beneficiaries: "المستفيدون",
        occupancy: "الإشغال",
        manager: "المدير",
        view_details: "عرض التفاصيل",
        capacity: "السعة",
        name: "الاسم",
        location: "الموقع",
        status: "الحالة",
        budget: "الميزانية السنوية",
        Active: "نشط",
        UnderReview: "قيد المراجعة",
        Inactive: "غير نشط",
    },
    tr: {
        title: "Yetimhane Yönetimi",
        kpiTotal: "Toplam Yetimhane",
        kpiBeneficiaries: "Toplam Faydalanıcı",
        kpiOccupancy: "Ort. Doluluk",
        kpiBudget: "Toplam Bütçe",
        search: "İsme veya şehre göre ara...",
        add: "Yetimhane Ekle",
        all_countries: "Tüm Ülkeler",
        all_statuses: "Tüm Durumlar",
        beneficiaries: "Faydalanıcılar",
        occupancy: "Doluluk",
        manager: "Yönetici",
        view_details: "Detayları Görüntüle",
        capacity: "Kapasite",
        name: "İsim",
        location: "Konum",
        status: "Durum",
        budget: "Yıllık Bütçe",
        Active: "Aktif",
        UnderReview: "İncelemede",
        Inactive: "Pasif",
    }
};


const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card p-5 rounded-xl shadow-soft border dark:border-slate-700/50">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
            </div>
        </div>
    </div>
);


const OrphanageManagement: React.FC = () => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

    const [orphanages, setOrphanages] = useState<Orphanage[]>(MOCK_ORPHANAGES);
    const [view, setView] = useState<'card' | 'list'>('card');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ country: 'all', status: 'all' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const toast = useToast();
    
    const stats = useMemo(() => {
        const activeOrphanages = orphanages.filter(o => o.status === 'Active');
        const totalBeneficiaries = activeOrphanages.reduce((sum, o) => sum + o.beneficiaryCount, 0);
        const totalCapacity = activeOrphanages.reduce((sum, o) => sum + o.capacity, 0);
        const occupancy = totalCapacity > 0 ? (totalBeneficiaries / totalCapacity) * 100 : 0;
        const totalBudget = activeOrphanages.reduce((sum, o) => sum + o.budget, 0);
        return { total: orphanages.length, beneficiaries: totalBeneficiaries, occupancy, budget: totalBudget };
    }, [orphanages]);

    const filteredOrphanages = useMemo(() => {
        return orphanages.filter(o => {
            const name = o.name[language] || o.name.en;
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || o.city.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCountry = filters.country === 'all' || o.country === filters.country;
            const matchesStatus = filters.status === 'all' || o.status === filters.status;
            return matchesSearch && matchesCountry && matchesStatus;
        });
    }, [orphanages, searchTerm, filters, language]);

    const countryOptions = useMemo(() => Array.from(new Set(orphanages.map(o => o.country))), [orphanages]);
    const statusOptions: OrphanageStatus[] = ['Active', 'Under Review', 'Inactive'];
    
    const handleAddOrphanage = (data: Omit<Orphanage, 'id' | 'logo'>) => {
        const newOrphanage: Orphanage = {
            ...data,
            id: `ORPH-${Date.now()}`,
            logo: '🏠',
        };
        setOrphanages(prev => [newOrphanage, ...prev]);
        toast.showSuccess('Orphanage added successfully.');
    };

    return (
        <>
            <AddOrphanageModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddOrphanage} t={t} />
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <OrphanageIcon /> {t('title')}
                </h1>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('kpiTotal')} value={formatNumber(useCountUp(stats.total), language)} icon={<Building2 />} />
                    <KpiCard title={t('kpiBeneficiaries')} value={formatNumber(useCountUp(stats.beneficiaries), language)} icon={<Users />} />
                    <KpiCard title={t('kpiOccupancy')} value={`${useCountUp(stats.occupancy).toFixed(1)}%`} icon={<PieChart />} />
                    <KpiCard title={t('kpiBudget')} value={formatCurrency(useCountUp(stats.budget), language)} icon={<DollarSign />} />
                </div>

                {/* Controls */}
                <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('search')} className="w-full py-2 ps-10 pe-4 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <select value={filters.country} onChange={e => setFilters(f => ({...f, country: e.target.value}))} className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                                <option value="all">{t('all_countries')}</option>
                                {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                                <option value="all">{t('all_statuses')}</option>
                                {statusOptions.map(s => <option key={s} value={s}>{t(s.replace(' ', ''))}</option>)}
                            </select>
                            <div className="p-1 bg-gray-100 dark:bg-slate-900 rounded-lg flex items-center">
                                <button onClick={() => setView('card')} className={`p-1.5 rounded-md ${view === 'card' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><LayoutGrid /></button>
                                <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><List /></button>
                            </div>
                            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /><span>{t('add')}</span></button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {view === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrphanages.map(o => <OrphanageCard key={o.id} orphanage={o} t={t} />)}
                    </div>
                ) : (
                    <OrphanageTable orphanages={filteredOrphanages} t={t} />
                )}
            </div>
        </>
    );
};

export default OrphanageManagement;
