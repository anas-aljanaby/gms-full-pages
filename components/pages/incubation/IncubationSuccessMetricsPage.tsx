
import React, { useState, useCallback, FC, Suspense, lazy } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import type { Language, IncubationData, InstitutionalDonor, KnowledgeData, KnowledgeArticle } from '../../../types';
import { SparklesIcon, Edit, Download, Contrast } from 'lucide-react';
import Spinner from '../../common/Spinner';
import AiCard from '../ai/AiCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid, LineChart, Line } from 'recharts';

const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: "مقاييس النجاح ومؤشرات الأداء",
        aiTitle: "ملخص تنفيذي (وضع تجريبي)",
        aiDescription: "بيانات تجريبية مخففة للأداء.",
        generate: "تحميل ملخص ثابت",
        generating: "جاري...",
        exportReport: "تصدير التقرير",
        editSummary: "تعديل الملخص",
        saveChanges: "حفظ التغييرات",
        exportAndSave: "تصدير وحفظ",
        exporting: "جاري التصدير...",
        exportSuccess: "تم حفظ المقال في المكتبة (تجريبي).",
        exportPreviewTitle: "معاينة التصدير",
        exportPreviewDesc: "تعديل الملخص قبل الحفظ.",
        toggleHighContrast: "تبديل التباين",
        moveItem: "تحريك",
        hideItem: "إخفاء",
    },
    en: {
        title: "Incubation Success Metrics & KPIs",
        aiTitle: "Executive summary (demo)",
        aiDescription: "Reduced demo data for performance.",
        generate: "Load static summary",
        generating: "Loading...",
        exportReport: "Export report",
        editSummary: "Edit summary",
        saveChanges: "Save changes",
        exportAndSave: "Export & save",
        exporting: "Exporting...",
        exportSuccess: "Article saved to library (demo).",
        exportPreviewTitle: "Export preview",
        exportPreviewDesc: "Edit the summary before saving.",
        toggleHighContrast: "Toggle high contrast",
        moveItem: "Move item",
        hideItem: "Hide item",
    },
    tr: {
        title: "Kuluçka Başarı Metrikleri",
        aiTitle: "Yönetici özeti (demo)",
        aiDescription: "Performans için küçük demo veri.",
        generate: "Özet yükle",
        generating: "Yükleniyor...",
        exportReport: "Raporu dışa aktar",
        editSummary: "Özeti düzenle",
        saveChanges: "Kaydet",
        exportAndSave: "Dışa aktar ve kaydet",
        exporting: "Dışa aktarılıyor...",
        exportSuccess: "Makale kaydedildi (demo).",
        exportPreviewTitle: "Önizleme",
        exportPreviewDesc: "Kaydetmeden önce düzenleyin.",
        toggleHighContrast: "Yüksek kontrast",
        moveItem: "Taşı",
        hideItem: "Gizle",
    }
};

const ChartCard: FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-card dark:bg-dark-card p-4 h-full flex flex-col min-h-[200px] ${className}`}>
        <h4 className="font-bold text-center text-foreground dark:text-dark-foreground text-sm mb-2">{title}</h4>
        <div className="flex-grow min-h-[180px]">{children}</div>
    </div>
);

const FundingPerDonorChart: FC<{ data: any[]; dir: 'ltr' | 'rtl' }> = ({ data, dir }) => (
    <ChartCard title="Funding per donor">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: dir === 'ltr' ? 60 : 10, right: dir === 'rtl' ? 60 : 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} orientation={dir === 'rtl' ? 'right' : 'left'} />
                <Tooltip />
                <Bar dataKey="funding" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    </ChartCard>
);

const FundingVsImpactChart: FC<{ data: any[]; dir: 'ltr' | 'rtl' }> = ({ data, dir }) => (
    <ChartCard title="Funding vs impact">
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="funding" name="Funding" unit="$" />
                <YAxis type="number" dataKey="impact" name="Impact" orientation={dir === 'rtl' ? 'right' : 'left'} />
                <ZAxis dataKey="jobs" range={[60, 400]} name="Jobs" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Startups" data={data} fill="#8884d8" />
            </ScatterChart>
        </ResponsiveContainer>
    </ChartCard>
);

const GrantDistributionChart: FC<{ data: any[]; dir: 'ltr' | 'rtl' }> = ({ data, dir: _dir }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <ChartCard title="Grants by sector">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const ROIVsMentorshipChart: FC<{ data: any[]; dir: 'ltr' | 'rtl' }> = ({ data, dir }) => (
    <ChartCard title="ROI vs mentorship">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mentorship" />
                <YAxis dataKey="roi" orientation={dir === 'rtl' ? 'right' : 'left'} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roi" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    </ChartCard>
);

const SkeletonLoader: FC<{ type: 'chart' }> = () => <div className="h-40 w-full bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />;

const LazyFundingPerDonorChart = lazy(() => Promise.resolve({ default: FundingPerDonorChart }));
const LazyFundingVsImpactChart = lazy(() => Promise.resolve({ default: FundingVsImpactChart }));
const LazyGrantDistributionChart = lazy(() => Promise.resolve({ default: GrantDistributionChart }));
const LazyROIVsMentorshipChart = lazy(() => Promise.resolve({ default: ROIVsMentorshipChart }));

const kpiWidgets: Record<string, { name: string; component: React.FC<any> }> = {
    fundingPerDonor: { name: 'Funding Per Donor', component: LazyFundingPerDonorChart },
    fundingVsImpact: { name: 'Funding vs Impact', component: LazyFundingVsImpactChart },
    grantDistribution: { name: 'Grant Distribution', component: LazyGrantDistributionChart },
    roiVsMentorship: { name: 'ROI vs Mentorship', component: LazyROIVsMentorshipChart },
};

const demoChartData = (incubationData: IncubationData) => {
    const s = incubationData.startups.slice(0, 2);
    return {
        perDonor: s.map((x) => ({ name: x.name, funding: x.funding })),
        scatter: s.map((x) => ({ funding: x.funding, impact: 50 + (x.jobsCreated || 0) * 5, jobs: x.jobsCreated || 1 })),
        pie: [{ name: s[0]?.sector || 'A', value: 40 }, { name: s[1]?.sector || 'B', value: 60 }],
        line: [
            { mentorship: 1, roi: 1.1 },
            { mentorship: 2, roi: 1.2 },
        ],
    };
};

const ExportPreviewModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    onExportAndSave: (finalSummary: string) => void;
    dir: 'ltr' | 'rtl';
    incubationData: IncubationData;
}> = ({ isOpen, onClose, summary, onExportAndSave, dir, incubationData }) => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const [editedSummary, setEditedSummary] = useState(summary);
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const d = demoChartData(incubationData);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        await onExportAndSave(editedSummary);
        setIsExporting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-6xl m-4 flex flex-col max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
                dir={dir}
            >
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('exportPreviewTitle')}</h2>
                    <p className="text-sm text-gray-500">{t('exportPreviewDesc')}</p>
                </div>

                <div className="printable-section-container flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                    <div className="md:col-span-1 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Summary</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-1 text-xs font-semibold text-primary"
                            >
                                <Edit size={14} /> {isEditing ? t('saveChanges') : t('editSummary')}
                            </button>
                        </div>
                        {isEditing ? (
                            <textarea
                                value={editedSummary}
                                onChange={(e) => setEditedSummary(e.target.value)}
                                className="w-full flex-grow p-2 border rounded-md bg-white min-h-[120px]"
                            />
                        ) : (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none flex-grow"
                                dangerouslySetInnerHTML={{ __html: editedSummary.replace(/\n/g, '<br/>') }}
                            />
                        )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(kpiWidgets).map((key) => {
                            const W = kpiWidgets[key].component;
                            return (
                                <div key={key} className="bg-card dark:bg-dark-card rounded-lg overflow-hidden shadow-md min-h-[220px]">
                                    <Suspense fallback={<SkeletonLoader type="chart" />}>
                                        {key === 'fundingPerDonor' && <W data={d.perDonor} dir={dir} />}
                                        {key === 'fundingVsImpact' && <W data={d.scatter} dir={dir} />}
                                        {key === 'grantDistribution' && <W data={d.pie} dir={dir} />}
                                        {key === 'roiVsMentorship' && <W data={d.line} dir={dir} />}
                                    </Suspense>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-lg" type="button">
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-lg flex items-center gap-2 disabled:bg-gray-400"
                        type="button"
                    >
                        {isExporting ? <Spinner size="w-4 h-4" /> : <Download size={16} />}
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

const STATIC_SUMMARY =
    '## Achievements\n- Demo cohort data loaded.\n\n## Risks\n- (Demo) Limited sample size.\n\n## Recommendations\n- Use production analytics for real insights.';

const IncubationSuccessMetricsPage: React.FC<IncubationSuccessMetricsPageProps> = ({
    incubationData,
    institutionalDonors: _institutionalDonors,
    setKnowledgeData,
}) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const toast = useToast();

    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);
    const d = demoChartData(incubationData);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 300));
        setSummary(STATIC_SUMMARY);
        setIsLoading(false);
    }, []);

    const handleExportAndSave = useCallback(
        async (finalSummary: string) => {
            const now = new Date();
            const quarter = Math.floor(now.getMonth() / 3) + 1;
            const newArticle: KnowledgeArticle = {
                id: `report-incubation-${now.getTime()}`,
                title: {
                    en: `Incubation Report - Q${quarter} ${now.getFullYear()}`,
                    ar: `تقرير - Q${quarter}`,
                    tr: `Rapor - Q${quarter}`,
                },
                content: { en: finalSummary, ar: finalSummary, tr: finalSummary },
                category: { en: 'Reports', ar: 'تقارير', tr: 'Raporlar' },
                author_id: 'system',
                author_name: 'System',
                created_date: now.toISOString(),
                views: 0,
                tags: ['incubation', 'demo'],
            };
            setKnowledgeData((prev) => ({ ...prev, articles: [newArticle, ...prev.articles] }));
            toast.showSuccess(t('exportSuccess'));
            setIsExportModalOpen(false);
        },
        [setKnowledgeData, t, toast]
    );

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
                incubationData={incubationData}
            />
            <div className={`space-y-6 ${isHighContrast ? 'high-contrast-incubation' : ''}`} dir={dir}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsHighContrast(!isHighContrast)}
                            aria-pressed={isHighContrast}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                        >
                            <Contrast className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsExportModalOpen(true)}
                            disabled={!summary}
                            className="px-5 py-2.5 bg-secondary text-white font-semibold rounded-lg disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {t('exportReport')}
                        </button>
                    </div>
                </div>

                <AiCard title={t('aiTitle')} icon={<SparklesIcon className="w-6 h-6 text-primary" />}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('aiDescription')}</p>
                    {!summary && (
                        <button
                            type="button"
                            onClick={handleGenerateSummary}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {isLoading ? <Spinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                            {isLoading ? t('generating') : t('generate')}
                        </button>
                    )}
                    {summary && <div className="mt-4 p-4 bg-card/50 rounded-xl max-h-60 overflow-y-auto">{renderSummary(summary)}</div>}
                </AiCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Suspense fallback={<SkeletonLoader type="chart" />}>
                        <LazyFundingPerDonorChart data={d.perDonor} dir={dir} />
                    </Suspense>
                    <Suspense fallback={<SkeletonLoader type="chart" />}>
                        <LazyFundingVsImpactChart data={d.scatter} dir={dir} />
                    </Suspense>
                    <Suspense fallback={<SkeletonLoader type="chart" />}>
                        <LazyGrantDistributionChart data={d.pie} dir={dir} />
                    </Suspense>
                    <Suspense fallback={<SkeletonLoader type="chart" />}>
                        <LazyROIVsMentorshipChart data={d.line} dir={dir} />
                    </Suspense>
                </div>
            </div>
        </>
    );
};

export default IncubationSuccessMetricsPage;
