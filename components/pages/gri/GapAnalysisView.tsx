





import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import type { Language } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import Spinner from '../../common/Spinner';

interface GapAnalysisViewProps {
    onBack: () => void;
    onStartQuestionnaire: () => void;
}

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

const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ onBack, onStartQuestionnaire }) => {
    const { t, language } = useLocalization();
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
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Spinner text={t('gri_reporting.gapAnalysis.loading')} />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }
    
    if (!analysis || !questions) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                    {t('gri_reporting.gapAnalysis.title')}
                </h1>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('gri_reporting.gapAnalysis.backToDashboard')}
                </button>
            </div>
            
            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <h2 className="text-xl font-bold mb-4">{t('gri_reporting.gapAnalysis.summaryTitle')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-3xl font-bold">{analysis.summary.totalDisclosures}</p>
                        <p className="text-sm text-gray-500">{t('gri_reporting.statuses.total', { count: analysis.summary.totalDisclosures })}</p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-3xl font-bold text-red-600">{analysis.summary.missing}</p>
                        <p className="text-sm text-red-700 dark:text-red-200">{t('gri_reporting.statuses.missing')}</p>
                    </div>
                </div>
                 <div className="mt-4">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                        <span>{t('gri_reporting.overallCompletion')}</span>
                        <span>{analysis.summary.completionRate}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: analysis.summary.completionRate }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4">{t('gri_reporting.gapAnalysis.criticalGapsTitle')}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t('gri_reporting.gapAnalysis.criticalGapsDesc')}</p>
                    <div className="space-y-3">
                        {analysis.criticalGaps.map(gap => (
                            <div key={gap.disclosure} className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                <p className="font-bold text-yellow-800 dark:text-yellow-200">{gap.disclosure}: {gap.title}</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">البيانات المفقودة: {gap.missingData.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                     <h2 className="text-xl font-bold mb-4">{t('gri_reporting.gapAnalysis.aiQuestionsTitle')}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t('gri_reporting.gapAnalysis.aiQuestionsDesc')}</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {/* FIX: Refactored to use Object.keys() to avoid type inference issues with Object.entries() in this project's setup. */}
                        {Object.keys(groupedQuestions).map(category => {
                            const qs = groupedQuestions[category];
                            return (
                                <div key={category}>
                                    <h3 className="font-semibold text-primary dark:text-secondary capitalize">{t(`gri_reporting.gapAnalysis.category`)}: {category}</h3>
                                    <ul className="list-disc list-inside space-y-2 mt-2">
                                        {qs.map((q, i) => (
                                            <li key={i} className="text-sm">
                                                <span className="font-semibold">{t('gri_reporting.gapAnalysis.questionFor')} {q.disclosureId}:</span> {q.questionText}
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
                <button 
                    onClick={onStartQuestionnaire}
                    className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors"
                >
                    🚀 {t('gri_reporting.startDataCollection')}
                </button>
            </div>
        </div>
    );
};

export default GapAnalysisView;