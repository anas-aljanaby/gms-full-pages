
import React, { useState, useMemo, useCallback, useRef, FC, Suspense, lazy, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import type { Language, IncubationData, InstitutionalDonor, Startup, KnowledgeData, KnowledgeArticle } from '../../../types';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { SparklesIcon, LanguagesIcon, X, Edit, Move, EyeOff, Download, Contrast } from 'lucide-react';
import Spinner from '../../common/Spinner';
import AiCard from '../ai/AiCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid, LineChart, Line } from 'recharts';

// Local translations to avoid modifying global i18n files for this specific feature.
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: "مقاييس النجاح ومؤشرات الأداء",
        aiTitle: "ملخص تنفيذي بالذكاء الاصطناعي",
        aiDescription: "احصل على نظرة عامة فورية مدعومة بالذكاء الاصطناعي على أداء برنامج الحاضنة.",
        generate: "إنشاء ملخص",
        generating: "جاري الإنشاء...",
        exportReport: "تصدير التقرير",
        editSummary: "تعديل الملخص",
        saveChanges: "حفظ التغييرات",
        exportAndSave: "تصدير وحفظ",
        exporting: "جاري التصدير...",
        exportSuccess: "تم تصدير التقرير وحفظه في مكتبة المعرفة بنجاح!",
        exportPreviewTitle: "معاينة التصدير المباشر",
        exportPreviewDesc: "قم بتعديل الملخص، وأعد ترتيب الأقسام أو إخفاءها قبل التصدير النهائي.",
        toggleHighContrast: "تبديل وضع التباين العالي",
        moveItem: "تحريك العنصر",
        hideItem: "إخفاء العنصر",
    },
    en: {
        title: "Incubation Success Metrics & KPIs",
        aiTitle: "AI Executive Summary",
        aiDescription: "Get an instant, AI-powered overview of the incubation program's performance.",
        generate: "Generate Summary",
        generating: "Generating...",
        exportReport: "Export Report",
        editSummary: "Edit Summary",
        saveChanges: "Save Changes",
        exportAndSave: "Export & Save",
        exporting: "Exporting...",
        exportSuccess: "Report exported and saved to Knowledge Library successfully!",
        exportPreviewTitle: "Live Export Preview",
        exportPreviewDesc: "Edit the summary, reorder, or hide sections before final export.",
        toggleHighContrast: "Toggle high contrast mode",
        moveItem: "Move item",
        hideItem: "Hide item",
    },
    tr: {
        title: "Kuluçka Başarı Metrikleri ve KPI'ları",
        aiTitle: "AI Yönetici Özeti",
        aiDescription: "Kuluçka programının performansına ilişkin anında, yapay zeka destekli bir genel bakış edinin.",
        generate: "Özet Oluştur",
        generating: "Oluşturuluyor...",
        exportReport: "Raporu Dışa Aktar",
        editSummary: "Özeti Düzenle",
        saveChanges: "Değişiklikleri Kaydet",
        exportAndSave: "Dışa Aktar ve Kaydet",
        exporting: "Dışa aktarılıyor...",
        exportSuccess: "Rapor başarıyla dışa aktarıldı ve Bilgi Kütüphanesine kaydedildi!",
        exportPreviewTitle: "Canlı Dışa Aktarma Önizlemesi",
        exportPreviewDesc: "Son dışa aktarmadan önce özeti düzenleyin, bölümleri yeniden sıralayın veya gizleyin.",
        toggleHighContrast: "Yüksek kontrast modunu değiştir",
        moveItem: "Öğeyi taşı",
        hideItem: "Öğeyi gizle",
    }
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Chart Components (Defined here to be lazy-loaded) ---

const ChartCard: FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-card dark:bg-dark-card p-4 h-full flex flex-col ${className}`}>
        <h4 className="font-bold text-center text-foreground dark:text-dark-foreground text-sm mb-2">{title}</h4>
        <div className="flex-grow">{children}</div>
    </div>
);

const FundingPerDonorChart: FC<{ data: any[], dir: 'ltr' | 'rtl' }> = ({ data, dir }) => {
    return <ChartCard title="Funding Per Donor"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: dir === 'ltr' ? 60 : 10, right: dir === 'rtl' ? 60 : 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} orientation={dir === 'rtl' ? 'right' : 'left'} /><Tooltip /><Bar dataKey="funding" fill="#8884d8" /></BarChart></ResponsiveContainer></ChartCard>;
};

const FundingVsImpactChart: FC<{ data: any[], dir: 'ltr' | 'rtl' }> = ({ data, dir }) => {
    return <ChartCard title="Funding vs. Impact Score"><ResponsiveContainer width="100%" height="100%"><ScatterChart><CartesianGrid /><XAxis type="number" dataKey="funding" name="Funding" unit="$" /><YAxis type="number" dataKey="impact" name="Impact Score" orientation={dir === 'rtl' ? 'right' : 'left'} /><ZAxis dataKey="jobs" range={[100, 1000]} name="Jobs Created" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Startups" data={data} fill="#8884d8" /></ScatterChart></ResponsiveContainer></ChartCard>;
};

const GrantDistributionChart: FC<{ data: any[], dir: 'ltr' | 'rtl' }> = ({ data, dir }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return <ChartCard title="Grant Distribution by Sector"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartCard>;
};

const ROIVsMentorshipChart: FC<{ data: any[], dir: 'ltr' | 'rtl' }> = ({ data, dir }) => {
    return <ChartCard title="ROI vs. Mentorship Intensity"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mentorship" name="Mentorship Sessions" /><YAxis dataKey="roi" name="ROI" unit="x" orientation={dir === 'rtl' ? 'right' : 'left'} /><Tooltip /><Legend /><Line type="monotone" dataKey="roi" stroke="#82ca9d" /></LineChart></ResponsiveContainer></ChartCard>;
};

const SkeletonLoader: FC<{ type: 'chart' }> = ({ type }) => (
    <div className="h-full w-full bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center text-gray-400">Loading Chart...</div>
);

// --- Lazy-loaded Chart Components ---
const LazyFundingPerDonorChart = lazy(() => Promise.resolve({ default: FundingPerDonorChart }));
const LazyFundingVsImpactChart = lazy(() => Promise.resolve({ default: FundingVsImpactChart }));
const LazyGrantDistributionChart = lazy(() => Promise.resolve({ default: GrantDistributionChart }));
const LazyROIVsMentorshipChart = lazy(() => Promise.resolve({ default: ROIVsMentorshipChart }));


const kpiWidgets: Record<string, { name: string, component: React.FC<any> }> = {
    'fundingPerDonor': { name: 'Funding Per Donor', component: LazyFundingPerDonorChart },
    'fundingVsImpact': { name: 'Funding vs Impact', component: LazyFundingVsImpactChart },
    'grantDistribution': { name: 'Grant Distribution', component: LazyGrantDistributionChart },
    'roiVsMentorship': { name: 'ROI vs Mentorship', component: LazyROIVsMentorshipChart },
};

const defaultLayouts = {
    lg: [
        { i: 'fundingPerDonor', x: 0, y: 0, w: 1, h: 1 },
        { i: 'fundingVsImpact', x: 1, y: 0, w: 1, h: 1 },
        { i: 'grantDistribution', x: 0, y: 1, w: 1, h: 1 },
        { i: 'roiVsMentorship', x: 1, y: 1, w: 1, h: 1 },
    ],
};

const ExportPreviewModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    onExportAndSave: (finalSummary: string) => void;
    dir: 'ltr' | 'rtl';
}> = ({ isOpen, onClose, summary, onExportAndSave, dir }) => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const [editedSummary, setEditedSummary] = useState(summary);
    const [isEditing, setIsEditing] = useState(false);
    const [layouts, setLayouts] = useState(defaultLayouts);
    const [visibleItems, setVisibleItems] = useState<string[]>(Object.keys(kpiWidgets));
    const exportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEditedSummary(summary);
            setVisibleItems(Object.keys(kpiWidgets));
            setLayouts(defaultLayouts);
        }
    }, [isOpen, summary]);
    
    const handleExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        await onExportAndSave(editedSummary);
        setIsExporting(false);
    }
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-6xl m-4 flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()} dir={dir}>
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('exportPreviewTitle')}</h2>
                    <p className="text-sm text-gray-500">{t('exportPreviewDesc')}</p>
                </div>

                <div ref={exportRef} className="printable-section-container flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                    {/* Left Panel: Summary */}
                    <div className="md:col-span-1 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col">
                         <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold">Executive Summary</h3>
                             <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-1 text-xs font-semibold text-primary">
                                 <Edit size={14}/> {isEditing ? t('saveChanges') : t('editSummary')}
                             </button>
                         </div>
                         {isEditing ? (
                             <textarea value={editedSummary} onChange={e => setEditedSummary(e.target.value)} className="w-full h-full flex-grow p-2 border rounded-md bg-white"/>
                         ) : (
                             <div className="prose prose-sm dark:prose-invert max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: editedSummary.replace(/\n/g, '<br/>') }} />
                         )}
                    </div>
                    {/* Right Panel: Charts */}
                    <div className="md:col-span-2">
                        <ResponsiveGridLayout
                            layouts={layouts}
                            onLayoutChange={(layout, newLayouts) => setLayouts(newLayouts as any)}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                            cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
                            rowHeight={250}
                            draggableHandle=".drag-handle"
                        >
                            {visibleItems.map(key => {
                                const Widget = kpiWidgets[key].component;
                                return (
                                    <div key={key} className="bg-card dark:bg-dark-card rounded-lg overflow-hidden shadow-md relative group">
                                        <div className="absolute top-1 end-1 z-10 p-1 cursor-move bg-black/10 rounded-full drag-handle" aria-label={t('moveItem')}><Move size={12}/></div>
                                        <div className="absolute top-1 start-1 z-10 p-1 cursor-pointer bg-black/10 rounded-full" onClick={() => setVisibleItems(visibleItems.filter(i => i !== key))} aria-label={t('hideItem')}><EyeOff size={12}/></div>
                                        <Suspense fallback={<SkeletonLoader type="chart" />}>
                                            <Widget data={[]} dir={dir} />
                                        </Suspense>
                                    </div>
                                );
                            })}
                        </ResponsiveGridLayout>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-lg">{t('common.cancel')}</button>
                    <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-lg flex items-center gap-2 disabled:bg-gray-400">
                        {isExporting ? <Spinner size="w-4 h-4"/> : <Download size={16} />}
                        {isExporting ? t('exporting') : t('exportAndSave')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface IncubationSuccessMetricsPageProps {
  incubationData: IncubationData;
  institutionalDonors: InstitutionalDonor[];
  setKnowledgeData: React.Dispatch<React.SetStateAction<KnowledgeData>>;
}


const IncubationSuccessMetricsPage: React.FC<IncubationSuccessMetricsPageProps> = ({ incubationData, institutionalDonors, setKnowledgeData }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const toast = useToast();
    
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setSummary(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const dataContext = { totalStartups: incubationData.startups.length, jobsCreated: incubationData.startups.reduce((a, s) => a + (s.jobsCreated || 0), 0) };
            const systemInstruction = `You are an expert analyst for a non-profit's incubation program. Based on summary data, generate a concise, professional executive summary in markdown. Structure it into three sections: '## Achievements', '## Risks & Challenges', and '## Recommendations'. Provide the output in ${language}.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate the summary for this data: ${JSON.stringify(dataContext)}`,
                config: { systemInstruction }
            });
            setSummary(response.text);
        } catch (error) {
            toast.showError("Failed to generate AI summary.");
        } finally {
            setIsLoading(false);
        }
    }, [incubationData, toast, language]);

    const handleExportAndSave = useCallback(async (finalSummary: string) => {
        // This is a simplified export. A more robust solution would re-render the modal content for printing.
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        const newArticle: KnowledgeArticle = {
            id: `report-incubation-${now.getTime()}`,
            title: {
                en: `Incubation Success Report - Q${quarter} ${now.getFullYear()}`,
                ar: `تقرير نجاح الحاضنة - الربع ${quarter} ${now.getFullYear()}`,
                tr: `Kuluçka Başarı Raporu - Q${quarter} ${now.getFullYear()}`,
            },
            content: {
                en: finalSummary,
                ar: finalSummary,
                tr: finalSummary,
            },
            category: { en: 'Reports', ar: 'تقارير', tr: 'Raporlar' },
            author_id: 'system',
            author_name: 'System Admin',
            created_date: now.toISOString(),
            views: 0,
            tags: ['incubation', 'report', `Q${quarter}-${now.getFullYear()}`, `v${now.getTime()}`],
        };

        setKnowledgeData(prev => ({ ...prev, articles: [newArticle, ...prev.articles] }));
        toast.showSuccess(t('exportSuccess'));
        setIsExportModalOpen(false);
    }, [setKnowledgeData, t, toast]);
    
    const renderSummary = (text: string) => {
        const html = text
            .replace(/## (.*?)(?:\n|<br \/>)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*)/gm, '<li>$1</li>')
            .replace(/\n/g, '<br />');
        return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
    };
    
    return (
        <>
            <ExportPreviewModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                summary={summary || ''}
                onExportAndSave={handleExportAndSave}
                dir={dir}
            />
            <div className={`space-y-6 animate-fade-in ${isHighContrast ? 'high-contrast-incubation' : ''}`} dir={dir}>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsHighContrast(!isHighContrast)}
                            aria-pressed={isHighContrast}
                            aria-label={t('toggleHighContrast')}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                        >
                            <Contrast className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsExportModalOpen(true)} disabled={!summary} className="px-5 py-2.5 bg-secondary text-white font-semibold rounded-lg shadow hover:bg-secondary-dark transition-colors disabled:bg-gray-400 flex items-center gap-2">
                            {t('exportReport')}
                        </button>
                    </div>
                </div>
                
                <AiCard title={t('aiTitle')} icon={<SparklesIcon className="w-6 h-6 text-primary" />}>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('aiDescription')}</p>
                     {!summary && (
                        <button onClick={handleGenerateSummary} disabled={isLoading} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center gap-2">
                            {isLoading ? <Spinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                            {isLoading ? t('generating') : t('generate')}
                        </button>
                     )}
                     {summary && (
                        <div className="mt-4 p-4 bg-card/50 dark:bg-dark-card/50 rounded-xl max-h-60 overflow-y-auto">
                           {renderSummary(summary)}
                        </div>
                     )}
                </AiCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(kpiWidgets).map(([key, { name, component: Comp }]) => (
                        <Suspense key={key} fallback={<SkeletonLoader type="chart" />}>
                            <Comp data={[]} dir={dir} />
                        </Suspense>
                    ))}
                </div>
            </div>
        </>
    );
};

export default IncubationSuccessMetricsPage;
