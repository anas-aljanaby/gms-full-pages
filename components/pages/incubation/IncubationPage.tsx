
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { IncubationIcon } from '../../icons/ModuleIcons';
import type { IncubationData, Cohort, IncubationApplication, ApplicationStatus, Review, Startup, Language } from '../../types';
import { formatNumber, formatCurrency, formatDate } from '../../lib/utils';
import { Users, UserCheck, User, DollarSign, Calendar, UserPlus, Tv, ChevronRight, PlusCircle, Check, X, Mail, MessageSquare, Star } from 'lucide-react';
import Spinner from '../../common/Spinner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// --- LOCAL TRANSLATIONS to avoid modifying global i18n files ---
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        // Dashboard
        dashboardTitle: 'لوحة تحكم الاحتضان',
        investors: 'المستثمرون',
        mentors: 'المرشدون',
        founders: 'المؤسسون',
        activeCohorts: 'الدفعات النشطة',
        quickActions: 'إجراءات سريعة',
        addApplication: 'إضافة طلب',
        assignMentor: 'تعيين مرشد',
        viewDemoDay: 'عرض يوم العرض',
        activeCohortProgress: 'تقدم الدفعة النشطة',
        cohort: 'دفعة',
        weeksCompleted: 'أسابيع مكتملة',
        weeksRemaining: 'أسابيع متبقية',
        investorInterest: 'اهتمام المستثمرين',
        startupReadiness: 'جاهزية الشركة الناشئة',
        trainingAttendance: 'حضور التدريب',

        // Application Form
        formTitle: 'طلب الانضمام لبرنامج الاحتضان',
        formSubtitle: 'قدم فكرة شركتك الناشئة للانضمام إلى دفعتنا القادمة.',
        founderName: 'اسم المؤسس',
        founderEmail: 'البريد الإلكتروني للمؤسس',
        projectName: 'اسم المشروع',
        projectDescription: 'وصف المشروع',
        fundingNeed: 'التمويل المطلوب (بالدولار الأمريكي)',
        sector: 'القطاع',
        submit: 'إرسال الطلب',
        submitSuccess: 'تم إرسال طلبك بنجاح!',

        // Screening
        screeningTitle: 'تحكيم وفرز الطلبات',
        selectApplication: 'اختر طلبًا لعرض التفاصيل.',
        autoScore: 'التقييم التلقائي',
        reviews: 'المراجعات',
        addReviewPlaceholder: 'أضف مراجعتك هنا...',
        submitReview: 'إرسال المراجعة',
        accept: 'قبول',
        reject: 'رفض',
        applicationAccepted: 'تم قبول الطلب بنجاح.',
        stakeholderCreated: 'تم إنشاء سجل لصاحب المصلحة.',
        applicationRejected: 'تم رفض الطلب.',
    },
    en: {
        // Dashboard
        dashboardTitle: 'Incubation Dashboard',
        investors: 'Investors',
        mentors: 'Mentors',
        founders: 'Founders',
        activeCohorts: 'Active Cohorts',
        quickActions: 'Quick Actions',
        addApplication: 'Add Application',
        assignMentor: 'Assign Mentor',
        viewDemoDay: 'View Demo Day',
        activeCohortProgress: 'Active Cohort Progress',
        cohort: 'Cohort',
        weeksCompleted: 'weeks completed',
        weeksRemaining: 'weeks remaining',
        investorInterest: 'Investor Interest',
        startupReadiness: 'Startup Readiness',
        trainingAttendance: 'Training Attendance',

        // Application Form
        formTitle: 'Incubation Program Application',
        formSubtitle: 'Submit your startup idea to join our next cohort.',
        founderName: 'Founder Name',
        founderEmail: 'Founder Email',
        projectName: 'Project Name',
        projectDescription: 'Project Description',
        fundingNeed: 'Funding Need (USD)',
        sector: 'Sector',
        submit: 'Submit Application',
        submitSuccess: 'Your application has been submitted successfully!',
        
        // Screening
        screeningTitle: 'Application Screening & Review',
        selectApplication: 'Select an application to view details.',
        autoScore: 'Auto-Score',
        reviews: 'Reviews',
        addReviewPlaceholder: 'Add your review here...',
        submitReview: 'Submit Review',
        accept: 'Accept',
        reject: 'Reject',
        applicationAccepted: 'Application accepted successfully.',
        stakeholderCreated: 'Stakeholder record has been created.',
        applicationRejected: 'Application has been rejected.',
    },
    tr: {
        // Dashboard
        dashboardTitle: 'Kuluçka Kontrol Paneli',
        investors: 'Yatırımcılar',
        mentors: 'Mentorlar',
        founders: 'Kurucular',
        activeCohorts: 'Aktif Kohortlar',
        quickActions: 'Hızlı Eylemler',
        addApplication: 'Başvuru Ekle',
        assignMentor: 'Mentor Ata',
        viewDemoDay: 'Demo Gününü Görüntüle',
        activeCohortProgress: 'Aktif Kohort İlerlemesi',
        cohort: 'Kohort',
        weeksCompleted: 'hafta tamamlandı',
        weeksRemaining: 'hafta kaldı',
        investorInterest: 'Yatırımcı İlgisi',
        startupReadiness: 'Startup Hazırlığı',
        trainingAttendance: 'Eğitim Katılımı',
        
        // Application Form
        formTitle: 'Kuluçka Programı Başvurusu',
        formSubtitle: 'Bir sonraki grubumuza katılmak için startup fikrinizi gönderin.',
        founderName: 'Kurucu Adı',
        founderEmail: 'Kurucu E-postası',
        projectName: 'Proje Adı',
        projectDescription: 'Proje Açıklaması',
        fundingNeed: 'Finansman İhtiyacı (USD)',
        sector: 'Sektör',
        submit: 'Başvuruyu Gönder',
        submitSuccess: 'Başvurunuz başarıyla gönderildi!',

        // Screening
        screeningTitle: 'Başvuru Değerlendirme ve İnceleme',
        selectApplication: 'Ayrıntıları görüntülemek için bir başvuru seçin.',
        autoScore: 'Otomatik Puan',
        reviews: 'Değerlendirmeler',
        addReviewPlaceholder: 'Değerlendirmenizi buraya ekleyin...',
        submitReview: 'Değerlendirmeyi Gönder',
        accept: 'Kabul Et',
        reject: 'Reddet',
        applicationAccepted: 'Başvuru başarıyla kabul edildi.',
        stakeholderCreated: 'Paydaş kaydı oluşturuldu.',
        applicationRejected: 'Başvuru reddedildi.',
    },
};

// --- LOCAL STORAGE HOOK ---
const useIncubationApplications = (initialData: IncubationApplication[]): [IncubationApplication[], React.Dispatch<React.SetStateAction<IncubationApplication[]>>] => {
  const [applications, setApplications] = useState<IncubationApplication[]>(() => {
    try {
      const stored = localStorage.getItem('incubation-applications');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error("Could not read from localStorage", e); }
    return initialData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('incubation-applications', JSON.stringify(applications));
    } catch (e) { console.error("Could not write to localStorage", e); }
  }, [applications]);

  return [applications, setApplications];
};

// --- SUB-COMPONENTS for Dashboard ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number }> = ({ icon, title, value }) => (
    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 flex items-center justify-between">
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-4xl font-bold text-foreground dark:text-dark-foreground mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-full">
            {icon}
        </div>
    </div>
);

const KpiCircle: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft flex flex-col items-center text-center border dark:border-slate-700/50">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-200 dark:text-slate-700" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                    <circle className={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground dark:text-dark-foreground">{value}%</span>
            </div>
            <h4 className="mt-3 font-semibold text-sm text-foreground dark:text-dark-foreground">{title}</h4>
        </div>
    );
};

const DashboardView: React.FC<{ incubationData: IncubationData; setActiveModule: (module: string) => void }> = ({ incubationData, setActiveModule }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];
    const { cohorts, mentors, investors, startups } = incubationData;
    const activeCohort = cohorts.find(c => c.status === 'in-progress');

    const MentorItem: React.FC<{ name: string; role: string; photoUrl: string }> = ({ name, role, photoUrl }) => (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <img src={photoUrl} alt={name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>
            </div>
        </div>
    );

    const InvestorItem = MentorItem;

    const CohortCard: React.FC<{ cohort?: Cohort, startups: Startup[] }> = ({ cohort, startups }) => {
        if (!cohort) return <div className="h-full flex items-center justify-center text-gray-400">Cohort not found</div>;
        
        const startupCount = startups.filter(s => s.cohortId === cohort.id).length;
        const status = cohort.status;
        const statusClass = status === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
        
        return (
            <div className="flex justify-between items-center h-full cursor-pointer" onClick={() => setActiveModule('incubation_cohort')}>
                <div>
                    <h4 className="font-bold text-lg">{cohort.name}</h4>
                    <p className="text-sm text-gray-500">{new Date(cohort.startDate).getFullYear()}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{status}</span>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Users size={16} />
                            <span>Startups {startupCount}</span>
                        </div>
                    </div>
                </div>
                <ChevronRight size={24} className="text-gray-400" />
            </div>
        );
    };
    
    return (
        <div className="space-y-6" dir={dir}>
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">{t('dashboardTitle')}</h1>
                 <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronRight className="rtl:rotate-180" /></button>
            </div>
           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users size={24} />} title={t('investors')} value="2" />
                <StatCard icon={<User size={24} />} title={t('mentors')} value="2" />
                <StatCard icon={<UserCheck size={24} />} title={t('founders')} value="11" />
                <StatCard icon={<Calendar size={24} />} title={t('activeCohorts')} value="1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card dark:bg-dark-card/50 p-6 rounded-xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold mb-4">{t('quickActions')}</h3>
                    <div className="space-y-3">
                        <button onClick={() => setActiveModule('incubation_application')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="font-semibold">{t('addApplication')}</span><UserPlus />
                        </button>
                        <button onClick={() => setActiveModule('incubation_mentorship')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 transition-colors">
                             <span className="font-semibold">{t('assignMentor')}</span><User />
                        </button>
                         <button onClick={() => setActiveModule('incubation_demoday')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="font-semibold">{t('viewDemoDay')}</span><Tv />
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card dark:bg-dark-card/50 p-6 rounded-xl shadow-soft border dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold">{t('activeCohortProgress')}</h3>
                             <p className="font-semibold">{t('cohort')} {activeCohort?.name.replace('Cohort ', '') || '2025-A'}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">17 {t('weeksCompleted')} / 41 {t('weeksRemaining')}</p>
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-slate-700">
                             <div className="bg-blue-500 h-4 rounded-full" style={{ width: '29.3%' }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCircle title={t('investorInterest')} value={45} color="text-purple-500" />
                        <KpiCircle title={t('startupReadiness')} value={60} color="text-blue-500" />
                        <KpiCircle title={t('trainingAttendance')} value={85} color="text-green-500" />
                    </div>
                </div>
            </div>
             <div className="mt-12 space-y-8">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline px-1">
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Mentors</h2>
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Cohorts</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft">
                                <div className="space-y-2 divide-y divide-gray-100 dark:divide-slate-700">
                                    {mentors.slice(0, 2).map(m => (
                                        <MentorItem key={m.id} name={m.name} role={m.specialty} photoUrl={m.photoUrl} />
                                    ))}
                                </div>
                            </div>
                            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft">
                                <CohortCard cohort={cohorts.find(c => c.name === 'Cohort 2025-A')} startups={startups} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="flex justify-between items-baseline px-1">
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Investors</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft">
                                 <div className="space-y-2 divide-y divide-gray-100 dark:divide-slate-700">
                                    {investors.map(i => (
                                        <InvestorItem key={i.id} name={i.name} role={i.type} photoUrl={i.logoUrl} />
                                    ))}
                                </div>
                            </div>
                            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft">
                                <CohortCard cohort={cohorts.find(c => c.name === 'Cohort 2025-B')} startups={startups} />
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

const FormField: React.FC<{ label: string, children: React.ReactNode, required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-bold mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        {children}
    </div>
);

const ApplicationFormView: React.FC<{ onAddApplication: (data: any) => void }> = ({ onAddApplication }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];
    const toast = useToast();
    const [formData, setFormData] = useState({ founderName: '', founderEmail: '', projectName: '', projectDescription: '', sector: '', fundingNeed: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddApplication({ ...formData, fundingNeed: Number(formData.fundingNeed) });
        setFormData({ founderName: '', founderEmail: '', projectName: '', projectDescription: '', sector: '', fundingNeed: '' });
        toast.showSuccess(t('submitSuccess'));
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold text-center mb-2 text-foreground dark:text-dark-foreground">{t('formTitle')}</h1>
            <p className="text-center text-gray-500 mb-8 max-w-lg">{t('formSubtitle')}</p>
            <div className="w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-card dark:bg-dark-card p-8 rounded-2xl shadow-soft border dark:border-slate-700/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label={t('founderEmail')} required>
                            <input type="email" name="founderEmail" value={formData.founderEmail} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                        </FormField>
                         <FormField label={t('founderName')} required>
                            <input type="text" name="founderName" value={formData.founderName} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                        </FormField>
                    </div>
                     <FormField label={t('projectName')} required>
                        <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                    </FormField>
                     <FormField label={t('projectDescription')} required>
                        <textarea name="projectDescription" value={formData.projectDescription} onChange={handleChange} required rows={5} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField label={t('fundingNeed')} required>
                            <input type="number" name="fundingNeed" value={formData.fundingNeed} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                        </FormField>
                        <FormField label={t('sector')} required>
                           <input type="text" name="sector" value={formData.sector} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" />
                        </FormField>
                    </div>
                    <div className="flex justify-center pt-4">
                        <button type="submit" className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                            {t('submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const styles: Record<ApplicationStatus, string> = {
        'Pending': 'bg-gray-200 text-gray-800',
        'Under Review': 'bg-yellow-100 text-yellow-800',
        'Accepted': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const ScreeningView: React.FC<{ applications: IncubationApplication[]; onUpdateStatus: (id: string, status: ApplicationStatus) => void }> = ({ applications, onUpdateStatus }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];
    const [selectedApp, setSelectedApp] = useState<IncubationApplication | null>(applications[0] || null);
    
    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]" dir={dir}>
            <div className="md:w-1/3 bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex flex-col">
                <h2 className="text-xl font-bold mb-4 flex-shrink-0">{t('screeningTitle')}</h2>
                <div className="space-y-2 overflow-y-auto">
                    {applications.map(app => (
                        <button key={app.id} onClick={() => setSelectedApp(app)} className={`w-full text-start p-3 rounded-lg transition-colors ${selectedApp?.id === app.id ? 'bg-primary-light dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-800/50'}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold">{app.projectName}</h3>
                                <ApplicationStatusBadge status={app.status} />
                            </div>
                            <p className="text-sm text-gray-500">{app.founderName}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(app.date, language)}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border dark:border-slate-700/50 overflow-y-auto">
                {selectedApp ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedApp.projectName}</h2>
                            <p className="text-gray-500">by {selectedApp.founderName} ({selectedApp.founderEmail})</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"><p className="text-xs font-semibold text-gray-500">{t('sector')}</p><p className="font-bold">{selectedApp.sector}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"><p className="text-xs font-semibold text-gray-500">{t('fundingNeed')}</p><p className="font-bold">{formatCurrency(selectedApp.fundingNeed, language)}</p></div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><p className="text-xs font-semibold text-blue-600">{t('autoScore')}</p><p className="font-bold text-xl text-blue-700 dark:text-blue-200">{selectedApp.autoScore}</p></div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">{t('projectDescription')}</h4>
                            <p className="text-sm p-4 bg-gray-50 dark:bg-slate-800/50 rounded-md">{selectedApp.projectDescription}</p>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2">{t('reviews')} ({selectedApp.reviews.length})</h4>
                            <div className="space-y-3">
                                {selectedApp.reviews.map((review, i) => (
                                    <div key={i} className="p-3 border dark:border-slate-700 rounded-md">
                                        <div className="flex justify-between items-center text-xs">
                                            <p className="font-bold">{review.reviewerName}</p>
                                            <div className="flex items-center">{[...Array(5)].map((_, star) => <Star key={star} size={14} className={star < review.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}</div>
                                        </div>
                                        <p className="italic text-sm mt-1">"{review.comment}"</p>
                                    </div>
                                ))}
                                <div className="p-3 border-2 border-dashed dark:border-slate-600 rounded-md">
                                    <textarea rows={2} placeholder={t('addReviewPlaceholder')} className="w-full bg-transparent text-sm focus:outline-none" />
                                    <div className="flex justify-end"><button className="text-xs font-semibold bg-primary text-white px-3 py-1 rounded">{t('submitReview')}</button></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                             <button onClick={() => onUpdateStatus(selectedApp.id, 'Rejected')} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg flex items-center gap-2"><X size={16}/> {t('reject')}</button>
                            <button onClick={() => onUpdateStatus(selectedApp.id, 'Accepted')} className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2"><Check size={16}/> {t('accept')}</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">{t('selectApplication')}</div>
                )}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
interface IncubationPageProps {
  moduleKey: string;
  incubationData: IncubationData;
  setActiveModule: (module: string) => void;
}

const IncubationPage: React.FC<IncubationPageProps> = ({ moduleKey, incubationData, setActiveModule }) => {
    const { t: globalT, language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];
    const toast = useToast();
    const [applications, setApplications] = useIncubationApplications(incubationData.applications);

    const handleAddApplication = (data: Omit<IncubationApplication, 'id' | 'date' | 'status' | 'autoScore' | 'reviews'>) => {
      const newApp: IncubationApplication = {
          ...data,
          id: `APP-${Date.now()}`,
          date: new Date().toISOString(),
          status: 'Pending',
          autoScore: Math.floor(Math.random() * (95 - 65 + 1) + 65),
          reviews: [],
      };
      setApplications(prev => [newApp, ...prev]);
      toast.showSuccess(t('submitSuccess'));
      setActiveModule('incubation_screening'); // Navigate to screening to see the new application
    };

    const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      const app = applications.find(a => a.id === id);
      if (app) {
          toast.showInfo(`Email notification simulated for ${app.founderName} about their application being ${status}.`);
          if (status === 'Accepted') {
              toast.showSuccess(`Stakeholder record created for ${app.founderName}.`);
          }
      }
    };
    
    switch (moduleKey) {
        case 'incubation_application':
            return <ApplicationFormView onAddApplication={handleAddApplication} />;
        case 'incubation_screening':
            return <ScreeningView applications={applications} onUpdateStatus={handleUpdateStatus} />;
        case 'incubation_overview':
        case 'incubation':
            return <DashboardView incubationData={{...incubationData, applications}} setActiveModule={setActiveModule} />;
        default:
            // For other views, show a placeholder as per the minimal change principle.
            const title = globalT(`sidebar.${moduleKey}`);
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card dark:bg-dark-card rounded-2xl shadow-soft">
                    <div className="p-6 bg-primary-light dark:bg-primary/20 rounded-full mb-6">
                        <div className="text-primary dark:text-secondary"><IncubationIcon /></div>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground dark:text-dark-foreground mb-2">{title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{globalT('placeholder.underConstruction')}</p>
                    <p className="max-w-xl text-gray-400 dark:text-gray-500">{globalT('placeholder.wip', { moduleName: title.toLowerCase() })}</p>
                </div>
            );
    }
};

export default IncubationPage;
