
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../hooks/useTheme';
import { GRIReportingIcon } from '../icons/ModuleIcons';
import ProgressRing from '../common/ProgressRing';
import { ArrowLeft, Check, ChevronDown, FileText, Bot, Settings, X as XIcon, BarChart3, Activity, AlertTriangle, FileUp } from 'lucide-react';
import Spinner from '../common/Spinner';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import SmartQuestionnaireView from './gri/SmartQuestionnaireView';
import DataCollectionView from './gri/DataCollectionView';

// Self-contained component to avoid altering global i18n files
const translations = {
    ar: {
        title: "تقارير GRI",
        subtitle: "أداة شاملة لإدارة وإنشاء تقارير مبادرة التقارير العالمية الخاصة بك.",
        overallCompletion: "الإنجاز الكلي",
        universalStandards: "المعايير العالمية",
        topicStandards: "المعايير حسب الموضوع",
        sectorStandards: "المعايير القطاعية",
        statusBreakdown: "حالة الإفصاحات",
        statuses: {
            completed: "مكتمل",
            partial: "جزئي",
            missing: "مفقود",
            total: "إجمالي الإفصاحات"
        },
        materialTopics: "المواضيع الجوهرية التي يجب معالجتها",
        nextSteps: "جاهز للخطوة التالية؟",
        nextStepsDesc: "لديك خيارات متعددة للمتابعة في تقرير GRI الخاص بك. ابدأ بجمع البيانات يدويًا أو استخدم الذكاء الاصطناعي للعثور على الفجوات أولاً.",
        startDataCollection: "بدء جمع البيانات",
        dataCollection: {
            title: "جمع بيانات GRI",
            backToDashboard: "العودة إلى لوحة القيادة",
        },
        gapAnalysis: {
            runAnalysis: "تحليل الفجوات",
            title: "تحليل فجوات GRI",
            backToDashboard: "العودة إلى لوحة القيادة",
            loading: "الذكاء الاصطناعي يقوم بتحليل فجوات التقرير...",
            summaryTitle: "ملخص التحليل",
            criticalGapsTitle: "الفجوات الحرجة المكتشفة",
            criticalGapsDesc: "الإفصاحات الإلزامية التالية تحتوي على بيانات مفقودة.",
            aiQuestionsTitle: "أسئلة ذكية مولدة بالذكاء الاصطناعي",
            aiQuestionsDesc: "استخدم هذه الأسئلة لتوجيه عملية جمع البيانات للعناصر المفقودة.",
            questionFor: "سؤال بخصوص",
            error: "حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.",
            category: "الفئة"
        },
        questionnaire: {
            title: "استبيان جمع بيانات GRI الذكي",
        },
        settings: {
            title: "إعدادات نظام GRI",
            save: "حفظ الإعدادات"
        },
        placeholder: {
            underConstruction: "قيد الإنشاء"
        }
    },
    en: {},
    tr: {}
};

const useLocalTranslation = () => {
    return (key: string, options?: any) => {
        const keys = key.split('.');
        let result: any = translations['ar']; // Default to Arabic
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }

        if (options && typeof result === 'string') {
            Object.keys(options).forEach(optKey => {
                result = result.replace(`{${optKey}}`, options[optKey]);
            });
        }

        return result || key;
    };
};

type View = 'dashboard' | 'gapAnalysis' | 'questionnaire' | 'reportGeneration' | 'dataCollection';

interface Gap {
  disclosure: string;
  title: string;
  missingData: string[];
}

interface Question {
  disclosureId: string;
  disclosureTitle: string;
  questionText: string;
  category: string;
}

interface AnalysisResult {
    summary: {
        totalDisclosures: number;
        complete: number;
        partial: number;
        missing: number;
        completionRate: string;
    };
    criticalGaps: Gap[];
}

// --- Mock Data ---
const mockDashboardData = {
    overallCompletion: 25,
    universalStandards: 40,
    topicStandards: 15,
    sectorStandards: 0,
    statusBreakdown: [
        { name: 'completed', value: 5 },
        { name: 'partial', value: 8 },
        { name: 'missing', value: 32 },
    ],
    materialTopics: [
        'GRI 2-1: تفاصيل المنظمة',
        'GRI 2-7: الموظفون',
        'GRI 201-1: القيمة الاقتصادية المباشرة',
        'GRI 404-1: متوسط ساعات التدريب',
    ]
};

// --- Sub-components ---
const KpiCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex flex-col items-center text-center">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 h-10">{title}</h3>
        {children}
    </div>
);

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; t: (key: string) => string; }> = ({ isOpen, onClose, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('settings.title')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <p className="text-center text-gray-500">{t('placeholder.underConstruction')}</p>
                </div>
                 <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    );
};

// --- VIEWS ---

const DashboardView: React.FC<{ onNavigate: (view: View) => void; t: (key: string, options?: any) => string; }> = ({ onNavigate, t }) => {
    const { theme } = useTheme();
    const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
    const pieData = mockDashboardData.statusBreakdown.map(item => ({...item, name: t(`statuses.${item.name}`)}));

    return (
        <div className="space-y-8">
            <header className="text-center">
                <div className="inline-block p-4 bg-primary-light dark:bg-primary/20 rounded-full mb-4">
                    <GRIReportingIcon className="w-12 h-12 text-primary dark:text-secondary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground dark:text-dark-foreground">{t('title')}</h1>
                <p className="mt-2 max-w-2xl mx-auto text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('overallCompletion')}><ProgressRing percentage={mockDashboardData.overallCompletion} color="hsl(210, 40%, 50%)" label={`${mockDashboardData.overallCompletion}%`} size={120} /></KpiCard>
                <KpiCard title={t('universalStandards')}><ProgressRing percentage={mockDashboardData.universalStandards} color="#3B82F6" label={`${mockDashboardData.universalStandards}%`} size={120} /></KpiCard>
                <KpiCard title={t('topicStandards')}><ProgressRing percentage={mockDashboardData.topicStandards} color="#F59E0B" label={`${mockDashboardData.topicStandards}%`} size={120} /></KpiCard>
                <KpiCard title={t('sectorStandards')}><ProgressRing percentage={mockDashboardData.sectorStandards} color="#10B981" label={`${mockDashboardData.sectorStandards}%`} size={120} /></KpiCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4 text-center">{t('statusBreakdown')}</h3>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
                <div className="lg:col-span-3 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="font-bold text-lg mb-4">{t('materialTopics')}</h3>
                    <div className="space-y-3">{mockDashboardData.materialTopics.map((topic, index) => (<div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg"><span className="text-yellow-500 font-bold text-xl">⚠️</span><p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{topic}</p></div>))}</div>
                </div>
            </div>
            
            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 text-center">
                <h3 className="font-bold text-xl mb-2">{t('nextSteps')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl mx-auto">{t('nextStepsDesc')}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => onNavigate('dataCollection')} className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
                        {t('startDataCollection')}
                    </button>
                    <button onClick={() => onNavigate('gapAnalysis')} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                        {t('gapAnalysis.runAnalysis')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GapAnalysisView: React.FC<{ onBack: () => void; onStartQuestionnaire: () => void; t: (key: string) => string; }> = ({ onBack, onStartQuestionnaire, t }) => {
    const toast = useToast();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const runAnalysis = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // This is a simplified frontend simulation of the backend logic
                const mockAnalysis: AnalysisResult = {
                    summary: { totalDisclosures: 25, complete: 0, partial: 0, missing: 25, completionRate: '0.00%' },
                    criticalGaps: [
                        { disclosure: '2-1', title: 'تفاصيل المنظمة', missingData: ['الاسم القانوني', 'رقم التسجيل'] },
                        { disclosure: '2-7', title: 'الموظفون', missingData: ['عدد الموظفين', 'التوزيع حسب الجنس'] },
                        { disclosure: '201-1', title: 'القيمة الاقتصادية المباشرة', missingData: ['الإيرادات', 'المصروفات'] },
                        { disclosure: '404-1', title: 'متوسط ساعات التدريب', missingData: ['متوسط ساعات التدريب'] },
                    ]
                };
                setAnalysis(mockAnalysis);
                
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                 const systemInstruction = `You are a helpful assistant for a non-profit organization. Based on a list of critical gaps in a GRI report, your task is to generate smart, simple, and direct questions in Arabic to help the user collect the missing information.
                For each gap, generate one or more clear questions.
                Your response MUST be a JSON object with a single key 'questions' which is an array of question objects. Each question object must have 'disclosureId', 'disclosureTitle', 'questionText', and 'category' ('organizational', 'economic', 'social', 'environmental', or 'governance').`;

                const prompt = `Critical Gaps: ${JSON.stringify(mockAnalysis.criticalGaps)}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                questions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            disclosureId: { type: Type.STRING },
                                            disclosureTitle: { type: Type.STRING },
                                            questionText: { type: Type.STRING },
                                            category: { type: Type.STRING },
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                const result = JSON.parse(response.text.trim());
                setQuestions(result.questions);
            } catch (err) {
                console.error("Error during gap analysis:", err);
                setError(t('gri_reporting.gapAnalysis.error'));
                toast.showError(t('gri_reporting.gapAnalysis.error'));
            } finally {
                setIsLoading(false);
            }
        };
        runAnalysis();
    }, [t, toast]);

    const groupedQuestions = useMemo(() => {
        if (!questions) return {};
        return questions.reduce((acc, q) => {
            (acc[q.category] = acc[q.category] || []).push(q);
            return acc;
        }, {} as Record<string, Question[]>);
    }, [questions]);


    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-full text-center p-8"><Spinner text={t('gapAnalysis.loading')} /></div>;
    }
    if (error || !analysis || !questions) {
        return <div className="text-center p-8 text-red-500">{error || 'An unexpected error occurred.'}</div>;
    }

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('gapAnalysis.backToDashboard')}</button>
            <h1 className="text-3xl font-bold">{t('gapAnalysis.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4">{t('gapAnalysis.criticalGapsTitle')}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t('gapAnalysis.criticalGapsDesc')}</p>
                    <div className="space-y-3">{analysis.criticalGaps.map(gap => (<div key={gap.disclosure} className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg"><p className="font-bold text-yellow-800 dark:text-yellow-200">{gap.disclosure}: {gap.title}</p><p className="text-xs text-yellow-700 dark:text-yellow-300">البيانات المفقودة: {gap.missingData.join(', ')}</p></div>))}</div>
                </div>
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                     <h2 className="text-xl font-bold mb-4">{t('gapAnalysis.aiQuestionsTitle')}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t('gapAnalysis.aiQuestionsDesc')}</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {Object.keys(groupedQuestions).map(category => {
                            const qs = groupedQuestions[category];
                            return (
                                <div key={category}>
                                    <h3 className="font-semibold text-primary dark:text-secondary capitalize">{t(`gapAnalysis.category`)}: {category}</h3>
                                    <ul className="list-disc list-inside space-y-2 mt-2">
                                        {qs.map((q, i) => (
                                            <li key={i} className="text-sm">
                                                <span className="font-semibold">{t('gapAnalysis.questionFor')} {q.disclosureId}:</span> {q.questionText}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="text-center">
                <button onClick={onStartQuestionnaire} className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">🚀 {t('startDataCollection')}</button>
            </div>
        </div>
    );
};

const GRIReportingPage: React.FC = () => {
    const t = useLocalTranslation();
    const [view, setView] = useState<View>('dashboard');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const renderContent = () => {
        switch (view) {
            case 'dataCollection':
                return <DataCollectionView onBack={() => setView('dashboard')} />;
            case 'gapAnalysis':
                return <GapAnalysisView onBack={() => setView('dashboard')} onStartQuestionnaire={() => setView('questionnaire')} t={t} />;
            case 'questionnaire':
                return <SmartQuestionnaireView onBack={() => setView('dashboard')} />;
            default:
                return <DashboardView onNavigate={setView} t={t} />;
        }
    };
    
    return (
        <div dir="rtl">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} t={t} />
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                    <Settings />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default GRIReportingPage;
