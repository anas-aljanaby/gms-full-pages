import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { IncubationIcon } from '../icons/ModuleIcons';
import type { IncubationData, Cohort, IncubationApplication, ApplicationStatus, Review, Startup, Language } from '../../types';
import { formatNumber, formatCurrency, formatDate } from '../../lib/utils';
import { Users, UserCheck, User, DollarSign, Calendar, UserPlus, Tv, ChevronRight, PlusCircle, Check, X, Mail, MessageSquare, Star } from 'lucide-react';
import Spinner from '../common/Spinner';
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
        recentActivity: 'النشاطات الأخيرة',

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
        recentActivity: 'Recent Activity',

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
        <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft flex flex-col items-center text-center border dark:border-slate-700/50 h-full">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-200 dark:text-slate-700" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                    <circle className={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground dark:text-dark-foreground">{value}%</span>
            </div>
            <h4 className="mt-3 font-semibold text-sm text-foreground dark:text-dark-foreground flex-grow">{title}</h4>
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
    const [formData, setFormData] = useState({ founderName: '', founderEmail: '', projectName: '', projectDescription: '', sector: '', fundingNeed: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddApplication({ ...formData, fundingNeed: Number(formData.fundingNeed) });
        setFormData({ founderName: '', founderEmail: '', projectName: '', projectDescription: '', sector: '', fundingNeed: '' });
    };

    return (
        <div data-view-id="incubation_application.form" className="flex flex-col items-center justify-center p-4 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold text-center mb-2 text-foreground dark:text-dark-foreground">{t('formTitle')}</h1>
            <p className="text-center text-gray-500 mb-8 max-w-lg">{t('formSubtitle')}</p>
            <div className="w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-card dark:bg-dark-card p-8 rounded-2xl shadow-soft border dark:border-slate-700/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label={t('founderName')} required><input type="text" name="founderName" value={formData.founderName} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" /></FormField>
                        <FormField label={t('founderEmail')} required><input type="email" name="founderEmail" value={formData.founderEmail} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600" /></FormField>
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

// --- SUB-COMPONENTS for Screening ---
const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const styles: Record<ApplicationStatus, string> = {
        'Pending': 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-gray-300',
        'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
        'Accepted': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
        'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const ApplicationCard: React.FC<{ application: IncubationApplication; onUpdateStatus: (id: string, status: ApplicationStatus) => void; onAddReview: (id: string, comment: string, score: number) => void; }> = ({ application, onUpdateStatus, onAddReview }) => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];
    const [reviewText, setReviewText] = useState('');

    const handleAddReview = () => {
        if (!reviewText.trim()) return;
        // Simple score for now, could be a star rating input
        const score = 5; 
        onAddReview(application.id, reviewText, score);
        setReviewText('');
    };

    return (
        <div className="bg-white dark:bg-dark-card/50 p-4 rounded-lg shadow-sm border dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="font-bold">{application.projectName}</h4>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-200 font-bold text-sm leading-none">{application.autoScore}</div>
            </div>
            <p className="text-sm"><strong>{t('founderName')}:</strong> {application.founderName}</p>
            <p className="text-sm"><strong>{t('sector')}:</strong> {application.sector}</p>
            <p className="text-sm"><strong>{t('fundingNeed')}:</strong> {formatCurrency(application.fundingNeed, language)}</p>
            <div className="pt-2 border-t dark:border-slate-600">
                 <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={2} placeholder={t('addReviewPlaceholder')} className="w-full bg-gray-50 dark:bg-slate-800 text-sm p-2 border rounded-md" />
                 <button onClick={handleAddReview} className="text-xs font-semibold bg-primary text-white px-3 py-1 rounded mt-1">{t('submitReview')}</button>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-600">
                <button onClick={() => onUpdateStatus(application.id, 'Rejected')} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg flex items-center gap-1"><X size={14}/> {t('reject')}</button>
                <button onClick={() => onUpdateStatus(application.id, 'Accepted')} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-1"><Check size={14}/> {t('accept')}</button>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ title: string; applications: IncubationApplication[]; onUpdateStatus: (id: string, status: ApplicationStatus) => void; onAddReview: (id: string, comment: string, score: number) => void; }> = ({ title, applications, onUpdateStatus, onAddReview }) => (
    <div className="flex-1 bg-gray-100 dark:bg-dark-card/30 rounded-xl p-3">
        <h3 className="font-bold mb-3 px-2">{title} ({applications.length})</h3>
        <div className="space-y-3 h-full overflow-y-auto">
            {applications.map(app => (
                <ApplicationCard key={app.id} application={app} onUpdateStatus={onUpdateStatus} onAddReview={onAddReview} />
            ))}
        </div>
    </div>
);

const ScreeningView: React.FC<{ applications: IncubationApplication[]; onUpdateStatus: (id: string, status: ApplicationStatus) => void; onAddReview: (id: string, comment: string, score: number) => void; }> = ({ applications, onUpdateStatus, onAddReview }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language as Language]?.[key] || localTranslations.en[key];

    const columns = useMemo(() => ({
        'Pending': applications.filter(a => a.status === 'Pending'),
        'Under Review': applications.filter(a => a.status === 'Under Review'),
        'Accepted': applications.filter(a => a.status === 'Accepted'),
        'Rejected': applications.filter(a => a.status === 'Rejected'),
    }), [applications]);

    return (
        <div data-view-id="incubation_screening.board" className="flex flex-col md:flex-row gap-6 h-full p-4" dir={dir}>
            {Object.entries(columns).map(([title, apps]) => (
                <KanbanColumn key={title} title={title} applications={apps} onUpdateStatus={onUpdateStatus} onAddReview={onAddReview} />
            ))}
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
      setActiveModule('incubation_screening'); // Navigate to screening to see the new application
    };

    const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      const app = applications.find(a => a.id === id);
      if (app) {
          if (status === 'Accepted') toast.showSuccess(t('applicationAccepted'));
          if (status === 'Rejected') toast.showInfo(t('applicationRejected'));
      }
    };
    
    const handleAddReview = (id: string, comment: string, score: number) => {
        setApplications(prev => prev.map(app => {
            if (app.id === id) {
                const newReview: Review = {
                    reviewerName: 'Current User', // Placeholder
                    comment,
                    score,
                    date: new Date().toISOString()
                };
                // Also move to "Under Review" if it's currently "Pending"
                const newStatus = app.status === 'Pending' ? 'Under Review' : app.status;
                return { ...app, status: newStatus, reviews: [...app.reviews, newReview] };
            }
            return app;
        }));
    };
    
    switch (moduleKey) {
        case 'incubation_application':
            return <ApplicationFormView onAddApplication={handleAddApplication} />;
        case 'incubation_screening':
            return <ScreeningView applications={applications} onUpdateStatus={handleUpdateStatus} onAddReview={handleAddReview} />;
        case 'incubation_overview':
        case 'incubation':
            return <DashboardView incubationData={{...incubationData, applications}} setActiveModule={setActiveModule} />;
        default:
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