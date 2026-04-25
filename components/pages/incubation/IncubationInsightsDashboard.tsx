
import React, { useState, useMemo, useRef, lazy, Suspense, useCallback, FC } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import type { IncubationData, Language, KnowledgeData, KnowledgeArticle } from '../../../types';
import { Users, UserCheck, DollarSign, Zap, Briefcase, Award, Settings, FileText, ChevronDown, CheckSquare, BarChart as BarChartIcon, BrainCircuit, Bot, AlertTriangle, Info as InfoIcon, Download, Share2 } from 'lucide-react';
import Tabs from '../../common/Tabs';
import { useToast } from '../../../hooks/useToast';
import { GoogleGenAI, Type } from "@google/genai";
import Spinner from '../../common/Spinner';
// FIX: Added missing import for AiCard component.
import AiCard from '../ai/AiCard';

// FIX: Added localTranslations object for the ReportsExportView component.
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

interface KpiCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtext?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value, subtext }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex items-center gap-4">
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
            {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
    </div>
);


const ChartCard: FC<{ title: string, children: React.ReactNode, id?: string }> = ({ title, children, id }) => (
    <div id={id} className="bg-card dark:bg-dark-card p-4 h-80 flex flex-col rounded-xl shadow-soft border dark:border-slate-700/50">
        <h3 className="font-bold text-center text-foreground dark:text-dark-foreground text-sm mb-2">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

const ImpactOverviewView: React.FC<{ incubationData: IncubationData }> = ({ incubationData }) => {
    const { t, language, dir } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#f1f5f9' : '#334155';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const stats = useMemo(() => {
        const { startups, cohorts } = incubationData;
        const graduatedStartups = startups.filter(s => {
            const cohort = cohorts.find(c => c.id === s.cohortId);
            return cohort && cohort.status === 'completed';
        });
        
        const totalGraduated = graduatedStartups.length;
        const totalPostProgramFunding = startups.reduce((sum, s) => sum + (s.postProgramFunding || 0), 0);
        const totalJobsCreated = startups.reduce((sum, s) => sum + (s.jobsCreated || 0), 0);
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const graduatedAtLeast6Months = graduatedStartups.filter(s => {
            const cohort = cohorts.find(c => c.id === s.cohortId);
            return cohort && new Date(cohort.endDate) < sixMonthsAgo;
        });

        const survivedCount = graduatedAtLeast6Months.filter(s => s.status !== 'failed').length;
        const survivalRate = graduatedAtLeast6Months.length > 0 ? (survivedCount / graduatedAtLeast6Months.length) * 100 : 0;
        
        return { totalGraduated, survivalRate, totalPostProgramFunding, totalJobsCreated };
    }, [incubationData]);

    const fundingGrowthData = useMemo(() => {
        const sortedCohorts = [...incubationData.cohorts]
            .filter(c => c.status === 'completed')
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        let cumulativeFunding = 0;
        return sortedCohorts.map(cohort => {
            const cohortFunding = incubationData.startups
                .filter(s => s.cohortId === cohort.id)
                .reduce((sum, s) => sum + (s.postProgramFunding || 0), 0);
            cumulativeFunding += cohortFunding;
            return {
                name: cohort.name,
                funding: cumulativeFunding
            };
        });
    }, [incubationData]);

    const survivalData = [
        { name: t('incubation.insights.charts.survival_6m', "6 Months"), rate: stats.survivalRate },
        { name: t('incubation.insights.charts.survival_12m', "12 Months"), rate: 85.7 }, // Mock data
        { name: t('incubation.insights.charts.survival_18m', "18 Months"), rate: 80.1 }, // Mock data
    ];
    
    const sectorPieData = useMemo(() => {
        const counts = incubationData.startups.reduce((acc, s) => {
            acc[s.sector] = (acc[s.sector] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [incubationData]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div data-view-id="incubation_insights.impact_overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('incubation.insights.kpi.graduated', "Graduated Startups")} value={formatNumber(stats.totalGraduated, language)} icon={<Award />} />
                <KpiCard title={t('incubation.insights.kpi.funding', "Post-Program Funding")} value={formatCurrency(stats.totalPostProgramFunding, language)} icon={<DollarSign />} />
                <KpiCard title={t('incubation.insights.kpi.jobs', "Jobs Created")} value={formatNumber(stats.totalJobsCreated, language)} icon={<Briefcase />} />
                <KpiCard title={t('incubation.insights.kpi.survival', "6-Month Survival Rate")} value={`${stats.survivalRate.toFixed(1)}%`} icon={<Zap />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title={t('incubation.insights.charts.fundingGrowth', 'Cumulative Funding Growth Over Time')}>
                        <ResponsiveContainer>
                            <LineChart data={fundingGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} />
                                <YAxis tickFormatter={(val) => formatCurrency(Number(val), language)} tick={{ fill: textColor }} orientation={dir === 'rtl' ? 'right' : 'left'} />
                                <RechartsTooltip formatter={(val: unknown) => {
                                    const numericValue = Number(val);
                                    if (isNaN(numericValue)) {
                                        return String(val);
                                    }
                                    return formatCurrency(numericValue, language);
                                }} />
                                <Legend />
                                <Line type="monotone" dataKey="funding" name="Cumulative Funding" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                <ChartCard title={t('incubation.insights.charts.sectorDistribution', 'Startup Sector Distribution')} id="startup-sector-chart">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={sectorPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {sectorPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip formatter={(val: unknown) => {
                                const numericValue = Number(val);
                                if (isNaN(numericValue)) {
                                    return String(val);
                                }
                                return formatNumber(numericValue, language);
                            }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                <div className="lg:col-span-3">
                    <ChartCard title={t('incubation.insights.charts.survivalRate', 'Startup Survival Rate Over Time')}>
                         <ResponsiveContainer>
                            <BarChart data={survivalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                                <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fill: textColor }} orientation={dir === 'rtl' ? 'right' : 'left'} />
                                <RechartsTooltip formatter={(val: unknown) => {
                                    const numericValue = Number(val);
                                    if (isNaN(numericValue)) {
                                        return `${String(val)}%`;
                                    }
                                    return `${numericValue.toFixed(1)}%`;
                                }} />
                                <Bar dataKey="rate" name="Survival Rate" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

const DonorAnalyticsView: React.FC<{ incubationData: IncubationData }> = ({ incubationData }) => {
    const { t, language, dir } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#f1f5f9' : '#334155';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const stats = useMemo(() => {
        const { startups } = incubationData;
        const graduated = startups.filter(s => s.status === 'graduated');

        const totalContributions = startups.reduce((sum, s) => sum + s.funding, 0);

        const roiCalculations = graduated
            .map(s => s.funding > 0 ? (s.postProgramFunding || 0) / s.funding : 0)
            .filter(roi => roi > 0);
        const avgROI = roiCalculations.length > 0 ? roiCalculations.reduce((a, b) => a + b, 0) / roiCalculations.length : 0;

        const totalPlanned = startups.reduce((sum, s) => sum + s.financials.plannedBudget, 0);
        const totalSpent = startups.reduce((sum, s) => sum + s.financials.actualSpent, 0);
        const utilizationRate = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
        
        const donorRetention = 85; // Mocked data

        const costPerStartup = startups.length > 0 ? totalSpent / startups.length : 0;

        return { totalContributions, avgROI, utilizationRate, donorRetention, costPerStartup };
    }, [incubationData]);

    // Chart Data
    const fundingPerDonorData = useMemo(() => {
        return incubationData.investors.map(investor => {
            const fundedStartups = incubationData.startups.filter(s => s.investorIds.includes(investor.id));
            const totalFunding = fundedStartups.reduce((sum, s) => sum + s.funding, 0);
            return { name: investor.name, funding: totalFunding };
        }).filter(d => d.funding > 0).sort((a, b) => a.funding - b.funding);
    }, [incubationData]);
    
    const fundingVsImpactData = useMemo(() => {
        return incubationData.cohorts.map(cohort => {
            const cohortStartups = incubationData.startups.filter(s => s.cohortId === cohort.id);
            const cohortFunding = cohortStartups.reduce((sum, s) => sum + (s.postProgramFunding || s.funding), 0);
            const cohortImpactScore = cohortStartups.reduce((sum, s) => sum + (s.jobsCreated || 0) * 10 + (s.postProgramFunding || 0) / 1000, 0);
            return { name: cohort.name.replace('Cohort ', ''), funding: cohortFunding, impact: cohortImpactScore };
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [incubationData]);
    
    const grantsBySectorData = useMemo(() => {
        const bySector = incubationData.startups.reduce((acc, startup) => {
            acc[startup.sector] = (acc[startup.sector] || 0) + startup.funding;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(bySector).map(([name, value]) => ({ name, value }));
    }, [incubationData]);
    
    const roiVsMentorshipData = useMemo(() => {
        return incubationData.startups.filter(s => s.status === 'graduated' && s.funding > 0).map(startup => {
            const roi = (startup.postProgramFunding || 0) / startup.funding;
            const mentorshipCount = incubationData.mentorshipSessions.filter(sess => sess.startupId === startup.id).length;
            return { name: startup.name, mentorship: mentorshipCount, roi: parseFloat(roi.toFixed(2)) };
        });
    }, [incubationData]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div data-view-id="incubation_insights.donor_analytics" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <KpiCard title={t('incubation.insights.kpi.totalContributions', "Total Contributions")} value={formatCurrency(stats.totalContributions, language)} icon={<DollarSign />} />
                <KpiCard title={t('incubation.insights.kpi.avgROI', "Avg. ROI")} value={`${stats.avgROI.toFixed(1)}x`} icon={<BarChartIcon />} />
                <KpiCard title={t('incubation.insights.kpi.utilizationRate', "Funding Utilization")} value={`${stats.utilizationRate.toFixed(1)}%`} icon={<Zap />} />
                <KpiCard title={t('incubation.insights.kpi.donorRetention', "Donor Retention")} value={`${stats.donorRetention}%`} icon={<Users />} subtext="(Mocked)" />
                <KpiCard title={t('incubation.insights.kpi.costPerStartup', "Cost Per Startup")} value={formatCurrency(stats.costPerStartup, language)} icon={<Briefcase />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('incubation.insights.charts.fundingPerDonor', 'Funding Per Donor')}>
                    <ResponsiveContainer>
                        <BarChart data={fundingPerDonorData} layout="vertical" margin={{ left: 60, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" tickFormatter={(val) => formatCurrency(Number(val), language)} tick={{ fill: textColor, fontSize: 10 }} />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: textColor, fontSize: 10 }} orientation={dir === 'rtl' ? 'right' : 'left'} />
                            <RechartsTooltip formatter={(val: unknown) => formatCurrency(Number(val), language)} />
                            <Bar dataKey="funding" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title={t('incubation.insights.charts.fundingVsImpact', 'Funding vs. Impact Over Time')}>
                    <ResponsiveContainer>
                        <LineChart data={fundingVsImpactData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis yAxisId="left" tickFormatter={(val) => formatCurrency(Number(val), language)} tick={{ fill: textColor, fontSize: 10 }} orientation={dir === 'rtl' ? 'right' : 'left'} />
                            <YAxis yAxisId="right" dataKey="impact" orientation={dir === 'rtl' ? 'left' : 'right'} tick={{ fill: textColor, fontSize: 10 }} />
                            <RechartsTooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="funding" name="Funding" stroke="#8884d8" />
                            <Line yAxisId="right" type="monotone" dataKey="impact" name="Impact Score" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title={t('incubation.insights.charts.grantsBySector', 'Grants by Sector')}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={grantsBySectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {grantsBySectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip formatter={(val: unknown) => formatCurrency(Number(val), language)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title={t('incubation.insights.charts.roiVsMentorship', 'ROI vs. Mentorship Intensity')}>
                    <ResponsiveContainer>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" dataKey="mentorship" name="Mentorship Sessions" unit=" sessions" tick={{ fill: textColor, fontSize: 10 }} />
                            <YAxis type="number" dataKey="roi" name="ROI" unit="x" tick={{ fill: textColor, fontSize: 10 }} orientation={dir === 'rtl' ? 'right' : 'left'} />
                            <ZAxis dataKey="name" name="Startup" />
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Startups" data={roiVsMentorshipData} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const AiInsightsView: React.FC<{ incubationData: IncubationData }> = ({ incubationData }) => {
    const { language } = useLocalization();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setInsights([]);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const dataSummary = {
                startups: incubationData.startups.map(s => ({ name: s.name, sector: s.sector, funding: s.funding, status: s.status })),
                mentorshipSessions: incubationData.mentorshipSessions.slice(-10).map(ms => ({ mentorId: ms.mentorId, startupId: ms.startupId, date: ms.date.split('T')[0] })),
                mentors: incubationData.mentors.map(m => ({ id: m.id, name: m.name })),
            };

            const systemInstruction = `You are an expert analyst for a non-profit's startup incubation program. Analyze summary data to generate actionable insights.
- Detect anomalies: Look for startups with funding significantly lower than peers, or active mentors with no logged sessions in the last month.
- Generate ONE monthly summary of program activities.
- For ALL insights (anomalies, summaries), provide the content in English (en), Arabic (ar), and Turkish (tr) inside the 'content' object.
- Use the 'isSummary' boolean flag to indicate if the insight is the overall monthly summary.
- Respond ONLY with a valid JSON object matching the provided schema.`;

            const prompt = `Data summary: ${JSON.stringify(dataSummary)}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            insights: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        level: { type: Type.STRING, enum: ["info", "alert", "critical"] },
                                        content: {
                                            type: Type.OBJECT,
                                            properties: {
                                                en: { type: Type.STRING },
                                                ar: { type: Type.STRING },
                                                tr: { type: Type.STRING }
                                            },
                                            required: ['en', 'ar', 'tr']
                                        },
                                        isSummary: { type: Type.BOOLEAN }
                                    },
                                    required: ['level', 'content', 'isSummary']
                                }
                            }
                        },
                        required: ['insights']
                    }
                }
            });
            
            const result = JSON.parse(response.text.trim());
            setInsights(result.insights || []);

        } catch (err) {
            console.error("Error generating AI insights:", err);
            setError("Failed to generate insights. The AI may be experiencing issues. Please try again.");
            toast.showError("Failed to generate AI insights.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const cardConfig = {
        info: { icon: <InfoIcon className="w-6 h-6 text-blue-500" />, borderColor: 'border-blue-500' },
        alert: { icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, borderColor: 'border-yellow-500' },
        critical: { icon: <AlertTriangle className="w-6 h-6 text-red-500" />, borderColor: 'border-red-500' }
    };
    
    return (
        <div data-view-id="incubation_insights.ai_insights" className="space-y-6">
            <div className="text-center">
                <button 
                    onClick={handleGenerateInsights}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center gap-2 mx-auto"
                >
                    {isLoading ? <Spinner /> : <Bot />}
                    {isLoading ? "Generating..." : "Generate AI Insights"}
                </button>
            </div>
            
            {error && <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((insight, index) => {
                    const config = cardConfig[insight.level as 'info' | 'alert' | 'critical'];
                    const currentLangContent = insight.content[language as Language] || insight.content.en;
                    return (
                        <div key={index} className={`bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft border-l-4 ${config.borderColor}`}>
                           <div className="flex items-start gap-3">
                               {config.icon}
                               <div className="flex-1">
                                   {insight.isSummary ? (
                                       <div className="space-y-2">
                                           <h4 className="font-bold text-sm">Monthly Summary</h4>
                                           <details>
                                               <summary className="text-sm cursor-pointer" dir={language === 'ar' ? 'rtl' : 'ltr'}>{currentLangContent}</summary>
                                               <div className="mt-2 pt-2 border-t dark:border-slate-600 space-y-1">
                                                   <p className="text-xs"><span className="font-bold">EN:</span> {insight.content.en}</p>
                                                   <p className="text-xs text-right" dir="rtl">{insight.content.ar} <span className="font-bold">:AR</span></p>
                                                   <p className="text-xs"><span className="font-bold">TR:</span> {insight.content.tr}</p>
                                               </div>
                                           </details>
                                       </div>
                                   ) : (
                                       <p className="text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>{currentLangContent}</p>
                                   )}
                               </div>
                           </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface ReportsExportViewProps {
    incubationData: IncubationData;
    knowledgeData: KnowledgeData;
    setKnowledgeData: React.Dispatch<React.SetStateAction<KnowledgeData>>;
}

const ReportsExportView: React.FC<ReportsExportViewProps> = ({ incubationData, knowledgeData, setKnowledgeData }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    const toast = useToast();

    const [reportType, setReportType] = useState('monthly');
    const [includedSections, setIncludedSections] = useState({
        impact: true, donorAnalytics: true, financial: true, aiInsights: true
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a ${reportType} executive summary report for an incubation program in ${language}. Include these sections: ${Object.keys(includedSections).filter(k => (includedSections as any)[k]).join(', ')}. Use markdown for formatting. Data: ${JSON.stringify(incubationData)}`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setReportContent(response.text);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error(error);
            toast.showError(t('error_generating'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportAndSave = (finalContent: string) => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        const newArticle: KnowledgeArticle = {
            id: `report-inc-${now.getTime()}`,
            title: {
                en: `Incubation Report - ${reportType} - ${now.toLocaleDateString()}`,
                ar: `تقرير الحاضنة - ${reportType} - ${now.toLocaleDateString()}`,
                tr: `Kuluçka Raporu - ${reportType} - ${now.toLocaleDateString()}`,
            },
            content: { en: finalContent, ar: finalContent, tr: finalContent },
            category: { en: 'Reports', ar: 'تقارير', tr: 'Raporlar' },
            author_id: 'system-generated',
            author_name: 'AI Report Builder',
            created_date: now.toISOString(),
            views: 0,
            tags: ['incubation', 'report', reportType, `v${now.getTime()}`],
        };

        setKnowledgeData(prev => ({ ...prev, articles: [newArticle, ...prev.articles] }));
        toast.showSuccess(t('exportSuccess'));
        setIsPreviewOpen(false);
    };

    return (
        <div data-view-id="incubation_insights.reports_export">
            <AiCard title="Smart Report Builder" icon={<FileText />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">Report Type</h4>
                        <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 border rounded-md">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Include Sections</h4>
                        <div className="space-y-2 text-sm">
                            {Object.keys(includedSections).map(key => (
                                <label key={key} className="flex items-center gap-2">
                                    <input type="checkbox" checked={(includedSections as any)[key]} onChange={e => setIncludedSections(prev => ({...prev, [key]: e.target.checked}))} />
                                    {key}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex gap-4">
                    <button onClick={handleGenerate} disabled={isGenerating} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 disabled:bg-gray-400">
                        {isGenerating ? <Spinner /> : <Bot />}
                        {isGenerating ? t('generating') : t('generate')}
                    </button>
                </div>
            </AiCard>

            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsPreviewOpen(false)}>
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <h3 className="p-4 border-b font-bold">Report Preview</h3>
                        <div className="p-4 overflow-y-auto prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br />') }}></div>
                        <div className="p-4 border-t flex justify-end gap-2">
                            <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 text-sm border rounded-lg">Close</button>
                            <button onClick={() => handleExportAndSave(reportContent)} className="px-4 py-2 text-sm bg-secondary text-white rounded-lg">Export & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const PlaceholderView: React.FC<{ viewId: string; title: string }> = ({ viewId, title }) => (
    <div data-view-id={viewId} className="p-8 text-center text-gray-500 bg-card dark:bg-dark-card/50 rounded-xl">
        <h2 className="text-xl font-bold">{title}</h2>
        <p>This section is under construction.</p>
    </div>
);

interface IncubationInsightsDashboardProps {
  incubationData: IncubationData;
  knowledgeData: KnowledgeData;
  setKnowledgeData: React.Dispatch<React.SetStateAction<KnowledgeData>>;
}

const IncubationInsightsDashboard: React.FC<IncubationInsightsDashboardProps> = ({ incubationData, knowledgeData, setKnowledgeData }) => {
    const { t, language, dir } = useLocalization();
    const [activeTab, setActiveTab] = useState('impact_overview');

    const tabs = [
        { id: 'impact_overview', label: t('incubation.insights.tabs.impact_overview', "Impact Overview") },
        { id: 'donor_analytics', label: t('incubation.insights.tabs.donor_analytics', "Donor Analytics") },
        { id: 'ai_insights', label: t('incubation.insights.tabs.ai_insights', "AI Insights") },
        { id: 'reports_export', label: t('incubation.insights.tabs.reports_export', "Reports & Export") },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'impact_overview':
                return <ImpactOverviewView incubationData={incubationData} />;
            case 'donor_analytics':
                return <DonorAnalyticsView incubationData={incubationData} />;
            case 'ai_insights':
                 return <AiInsightsView incubationData={incubationData} />;
            case 'reports_export':
                 return <ReportsExportView incubationData={incubationData} knowledgeData={knowledgeData} setKnowledgeData={setKnowledgeData} />;
            default:
                return null;
        }
    };

    return (
        <div data-view-id="incubation_insights.dashboard" className="space-y-6 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                {t('incubation.insights.dashboardTitle', 'Incubation Insights Dashboard')}
            </h1>
            
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default IncubationInsightsDashboard;
