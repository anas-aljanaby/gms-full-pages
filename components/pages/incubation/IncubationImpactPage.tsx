
import React, { useState, useMemo, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import type { Language, IncubationData, InstitutionalDonor, Startup, KnowledgeData, KnowledgeArticle } from '../../../types';
import { Rocket, Zap, BarChart, Heart, Briefcase, FileText, Download, Bot, Share2, FileSpreadsheet, ChevronDown } from 'lucide-react';
import Spinner from '../../common/Spinner';

// Local translations to avoid modifying global i18n files for this specific feature.
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: "تقارير أثر برامج الاحتضان",
        kpi_incubated: "شركات ناشئة محتضنة",
        kpi_survival: "معدل البقاء (6 أشهر)",
        kpi_funding: "متوسط التمويل بعد البرنامج",
        kpi_jobs: "وظائف تم إنشاؤها",
        donor_impact_title: "مصفوفة أثر المانحين",
        donor: "المانح",
        funded_startups: "الشركات الناشئة الممولة",
        ai_summary_title: "ملخص تنفيذي بالذكاء الاصطناعي",
        select_cohort: "اختر دفعة لإنشاء ملخص مخصص",
        generate_summary: "إنشاء ملخص",
        export_pdf: "تصدير PDF",
        export_xlsx: "تصدير XLSX",
        generating: "جاري الإنشاء...",
        all_cohorts: "كل الدفعات",
        error_generating: "فشل إنشاء الملخص",
    },
    en: {
        title: "Incubation Impact Reports",
        kpi_incubated: "Startups Incubated",
        kpi_survival: "6-Month Survival Rate",
        kpi_funding: "Avg. Post-Program Funding",
        kpi_jobs: "Jobs Created",
        donor_impact_title: "Donor Impact Matrix",
        donor: "Donor",
        funded_startups: "Funded Startups",
        ai_summary_title: "AI Executive Summary",
        select_cohort: "Select a cohort to generate a custom summary",
        generate_summary: "Generate Summary",
        export_pdf: "Export PDF",
        export_xlsx: "Export XLSX",
        generating: "Generating...",
        all_cohorts: "All Cohorts",
        error_generating: "Failed to generate summary",
    },
    tr: {
        title: "Kuluçka Etki Raporları",
        kpi_incubated: "İnkübe Edilen Startup'lar",
        kpi_survival: "6 Aylık Hayatta Kalma Oranı",
        kpi_funding: "Ort. Program Sonrası Fonlama",
        kpi_jobs: "Oluşturulan İşler",
        donor_impact_title: "Bağışçı Etki Matrisi",
        donor: "Bağışçı",
        funded_startups: "Fonanmış Startup'lar",
        ai_summary_title: "AI Yönetici Özeti",
        select_cohort: "Özel bir özet oluşturmak için bir kohort seçin",
        generate_summary: "Özet Oluştur",
        export_xlsx: "XLSX'i Dışa Aktar",
        generating: "Oluşturuluyor...",
        all_cohorts: "Tüm Kohortlar",
        error_generating: "Özet oluşturulamadı",
    }
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card p-5 rounded-xl shadow-soft border dark:border-slate-700/50">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
            </div>
        </div>
    </div>
);

interface IncubationImpactPageProps {
  incubationData: IncubationData;
  institutionalDonors: InstitutionalDonor[];
}

const IncubationImpactPage: React.FC<IncubationImpactPageProps> = ({ incubationData, institutionalDonors }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const toast = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState<false | 'pdf' | 'xlsx'>(false);

    const stats = useMemo(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const graduatedStartups = incubationData.startups.filter(s => {
            const cohort = incubationData.cohorts.find(c => c.id === s.cohortId);
            return cohort && cohort.status === 'completed' && new Date(cohort.endDate) < sixMonthsAgo;
        });

        if (graduatedStartups.length === 0) {
            return { incubated: incubationData.startups.length, survivalRate: 0, avgFunding: 0, jobsCreated: 0 };
        }

        const survivedCount = graduatedStartups.filter(s => s.status !== 'failed').length;
        const survivalRate = (survivedCount / graduatedStartups.length) * 100;
        
        const totalPostProgramFunding = graduatedStartups.reduce((sum, s) => sum + (s.postProgramFunding || 0), 0);
        const avgFunding = survivedCount > 0 ? totalPostProgramFunding / survivedCount : 0;
        
        const jobsCreated = incubationData.startups.reduce((sum, s) => sum + (s.jobsCreated || 0), 0);

        return {
            incubated: incubationData.startups.length,
            survivalRate,
            avgFunding,
            jobsCreated
        };
    }, [incubationData]);

    const donorImpact = useMemo(() => {
        const mapping: Record<string, string[]> = {};
        incubationData.startups.forEach(startup => {
            startup.investorIds.forEach(investorId => {
                const donor = institutionalDonors.find(d => d.id === investorId);
                if (donor) {
                    const donorName = donor.organizationName[language] || donor.organizationName.en;
                    if (!mapping[donorName]) {
                        mapping[donorName] = [];
                    }
                    mapping[donorName].push(startup.name);
                }
            });
        });
        return mapping;
    }, [incubationData.startups, institutionalDonors, language]);
    
    const handleGenerateSummary = async () => {
        setIsLoadingSummary(true);
        setAiSummary('');

        const cohort = incubationData.cohorts.find(c => c.id === selectedCohortId);
        const cohortStartups = selectedCohortId === 'all' 
            ? incubationData.startups 
            : incubationData.startups.filter(s => s.cohortId === selectedCohortId);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a concise executive summary in ${language} for the "${cohort?.name || 'All Cohorts'}" incubation program based on this data: ${JSON.stringify(cohortStartups)}. Include key successes, total jobs created, total funding attracted, and areas for improvement.`;
            
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            
            setAiSummary(response.text);
        } catch (error) {
            console.error("AI summary generation failed:", error);
            setAiSummary(t('error_generating'));
            toast.showError(t('error_generating'));
        } finally {
            setIsLoadingSummary(false);
        }
    };
    
    const handleExport = async (type: 'pdf' | 'xlsx') => {
        setIsExporting(type);
        toast.showInfo(`Generating ${type.toUpperCase()} report...`);
        if (type === 'pdf' && reportRef.current) {
            try {
                const canvas = await html2canvas(reportRef.current, { scale: 1.5 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`incubation-impact-report.pdf`);
                toast.showSuccess("PDF report generated successfully!");
            } catch (e) {
                toast.showError("Failed to generate PDF.");
            }
        } else if (type === 'xlsx') {
            const wb = XLSX.utils.book_new();
            const kpiData = [
                { KPI: t('kpi_incubated'), Value: stats.incubated },
                { KPI: t('kpi_survival'), Value: `${stats.survivalRate.toFixed(1)}%` },
                { KPI: t('kpi_funding'), Value: stats.avgFunding },
                { KPI: t('kpi_jobs'), Value: stats.jobsCreated },
            ];
            const wsKpi = XLSX.utils.json_to_sheet(kpiData);
            XLSX.utils.book_append_sheet(wb, wsKpi, "Summary KPIs");

            const startupsData = incubationData.startups.map(s => ({
                Name: s.name, Cohort: s.cohortId, Status: s.status, 'Jobs Created': s.jobsCreated, 'Post-Program Funding': s.postProgramFunding,
            }));
            const wsStartups = XLSX.utils.json_to_sheet(startupsData);
            XLSX.utils.book_append_sheet(wb, wsStartups, "All Startups");

            const donorData = Object.entries(donorImpact).map(([donor, startups]: [string, string[]]) => ({
                Donor: donor, 'Funded Startups': startups.join(', '),
            }));
            const wsDonors = XLSX.utils.json_to_sheet(donorData);
            XLSX.utils.book_append_sheet(wb, wsDonors, "Donor Impact");
            
            XLSX.writeFile(wb, "incubation-impact-report.xlsx");
            toast.showSuccess("XLSX report generated successfully!");
        }
        setIsExporting(false);
    };

    const handleShareLink = () => {
        const url = `${window.location.href}&readonly=true`;
        navigator.clipboard.writeText(url);
        toast.showSuccess("Read-only dashboard link copied to clipboard!");
    };


    return (
        <div className="space-y-6 animate-fade-in" ref={reportRef} dir={dir}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <div className="relative">
                    <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">
                        <Download size={16}/> Export & Share <ChevronDown size={16} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isExportMenuOpen && (<div className="absolute end-0 mt-2 w-56 bg-card dark:bg-dark-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-scale-in-fast">
                        <div className="py-1">
                            <button onClick={() => handleExport('pdf')} className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700" disabled={isExporting === 'pdf'}>{isExporting === 'pdf' ? <Spinner size="w-4 h-4"/> : <FileText size={16} />} PDF Summary</button>
                            <button onClick={() => handleExport('xlsx')} className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700" disabled={isExporting === 'xlsx'}>{isExporting === 'xlsx' ? <Spinner size="w-4 h-4"/> : <FileSpreadsheet size={16} />} Detailed XLSX</button>
                            <button onClick={handleShareLink} className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"><Share2 size={16} /> Share Link</button>
                        </div>
                    </div>)}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('kpi_incubated')} value={formatNumber(useCountUp(stats.incubated), language)} icon={<Rocket />} />
                <KpiCard title={t('kpi_survival')} value={`${useCountUp(stats.survivalRate).toFixed(1)}%`} icon={<Heart />} />
                <KpiCard title={t('kpi_funding')} value={formatCurrency(useCountUp(stats.avgFunding), language)} icon={<BarChart />} />
                <KpiCard title={t('kpi_jobs')} value={formatNumber(useCountUp(stats.jobsCreated), language)} icon={<Briefcase />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4">{t('donor_impact_title')}</h3>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-start">
                           <thead className="sticky top-0 bg-card dark:bg-dark-card"><tr className="border-b dark:border-slate-700"><th className="p-2">{t('donor')}</th><th className="p-2">{t('funded_startups')}</th></tr></thead>
                            <tbody>
                                {Object.entries(donorImpact).map(([donor, startups]: [string, string[]]) => (
                                    <tr key={donor} className="border-b dark:border-slate-700/50">
                                        <td className="p-2 font-semibold align-top text-foreground dark:text-dark-foreground">{donor}</td>
                                        <td className="p-2 text-foreground dark:text-dark-foreground">{startups.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4">{t('ai_summary_title')}</h3>
                    <div className="flex gap-2 mb-4">
                        <select value={selectedCohortId} onChange={e => setSelectedCohortId(e.target.value)} className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                            <option value="all">{t('all_cohorts')}</option>
                            {incubationData.cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 disabled:bg-gray-400">
                            {isLoadingSummary ? <Spinner /> : <Zap size={16}/>} {t('generate_summary')}
                        </button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg min-h-[200px]">
                        {isLoadingSummary ? <div className="flex items-center justify-center h-full"><Spinner text={t('generating')} /></div> : (aiSummary ? <p className="text-sm whitespace-pre-wrap text-foreground dark:text-dark-foreground">{aiSummary}</p> : <p className="text-sm text-center text-gray-500">{t('select_cohort')}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncubationImpactPage;
