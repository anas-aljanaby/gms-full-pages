import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import type { IndividualDonor, Beneficiary, Project } from '../../../types';
import AiCard from './AiCard';
import Spinner from '../../common/Spinner';
import { SparklesIcon } from '../../icons/GenericIcons';
import { ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';

interface AIInsightsGeneratorProps {
    donors: IndividualDonor[];
    beneficiaries: Beneficiary[];
    projects: Project[];
}

type InsightCategory = 'Achievements' | 'Warnings' | 'Opportunities' | 'Predictions';
interface Insight {
    category: InsightCategory;
    text: Record<'en' | 'ar' | 'tr', string>;
    confidence: number;
    reasoning: Record<'en' | 'ar' | 'tr', string>;
}

const categoryConfig: Record<InsightCategory, { icon: string; color: string; }> = {
    Achievements: { icon: '🏆', color: 'border-green-500' },
    Warnings: { icon: '⚠️', color: 'border-red-500' },
    Opportunities: { icon: '🎯', color: 'border-blue-500' },
    Predictions: { icon: '📈', color: 'border-purple-500' },
};

const AIInsightsGenerator: React.FC<AIInsightsGeneratorProps> = ({ donors, beneficiaries, projects }) => {
    const { t, language } = useLocalization();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<Insight[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

    const handleGenerate = async () => {
        setIsLoading(true);
        setInsights(null);
        setError(null);

        try {
            const summary = {
                totalDonors: donors.length,
                totalDonations: donors.reduce((sum, d) => sum + d.totalDonations, 0),
                newDonorsLast30Days: donors.filter(d => d.donorSince && new Date(d.donorSince) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                projectCount: projects.length,
                projectsInProgress: projects.filter(p => p.stage === 'implementation' || p.stage === 'monitoring').length,
                projectsBehindSchedule: projects.filter(p => p.costManagement.financialSummary.spi < 1).length,
                projectsOverBudget: projects.filter(p => p.costManagement.financialSummary.cpi < 1).length,
                totalBeneficiaries: beneficiaries.length,
            };

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are an expert data analyst for a non-profit ERP. Analyze the provided summary data and generate actionable insights in 4 categories: Achievements, Warnings, Opportunities, Predictions. For each insight, provide a concise text in English, Arabic, and Turkish, a confidence score (0-100), and a brief reasoning for your conclusion in all three languages. Only return insights with a confidence score above 70. Your response MUST be a JSON object with a single key 'insights' which is an array of insight objects.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze this data: ${JSON.stringify(summary)}`,
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
                                        category: { type: Type.STRING },
                                        text: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, ar: { type: Type.STRING }, tr: { type: Type.STRING } } },
                                        confidence: { type: Type.NUMBER },
                                        reasoning: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, ar: { type: Type.STRING }, tr: { type: Type.STRING } } }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text.trim());
            setInsights(result.insights || []);

        } catch (err) {
            console.error("Error generating insights:", err);
            setError(t('ai_automation.insights_generator.error'));
            toast.showError(t('ai_automation.insights_generator.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExplanation = (index: number) => {
        setExpandedInsights(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    
    const groupedInsights = useMemo(() => {
        if (!insights) return {};
        return insights.reduce((acc, insight) => {
            (acc[insight.category] = acc[insight.category] || []).push(insight);
            return acc;
        }, {} as Record<InsightCategory, Insight[]>);
    }, [insights]);

    return (
        <AiCard title={t('ai_automation.insights_generator.title')} icon={<SparklesIcon className="text-primary w-6 h-6"/>}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('ai_automation.insights_generator.description')}</p>
            <div className="text-center">
                <button onClick={handleGenerate} disabled={isLoading} className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isLoading ? <Spinner text={t('ai_automation.insights_generator.generating')} /> : t('ai_automation.insights_generator.generateButton')}
                </button>
            </div>

            {error && <div className="mt-4 p-4 text-center text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}

            {insights && (
                <div className="mt-6 space-y-6">
                    <h3 className="text-xl font-bold">{t('ai_automation.insights_generator.resultsTitle')}</h3>
                    {Object.keys(groupedInsights).length > 0 ? (
                        Object.entries(groupedInsights).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    {categoryConfig[category as InsightCategory].icon}
                                    {t(`ai_automation.insights_generator.categories.${category}`)}
                                </h4>
                                <div className="space-y-4">
                                    {(items as Insight[]).map((insight, index) => (
                                        <div key={index} className={`p-4 rounded-lg border-l-4 ${categoryConfig[category as InsightCategory].color} bg-gray-50 dark:bg-slate-800/50`}>
                                            <p>{insight.text[language]}</p>
                                            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                                                <div className="flex items-center gap-4">
                                                    <span>{t('ai_automation.insights_generator.confidence')}: {insight.confidence}%</span>
                                                    <button onClick={() => toggleExplanation(index)} className="flex items-center gap-1 font-semibold hover:underline">
                                                        {t('ai_automation.insights_generator.explain')} <ChevronDown className={`w-4 h-4 transition-transform ${expandedInsights.has(index) ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{t('ai_automation.insights_generator.helpful')}</span>
                                                    <button onClick={() => toast.showSuccess(t('ai_automation.insights_generator.feedbackThanks'))} className="p-1 rounded-full hover:bg-green-100"><ThumbsUp size={14} /></button>
                                                    <button onClick={() => toast.showSuccess(t('ai_automation.insights_generator.feedbackThanks'))} className="p-1 rounded-full hover:bg-red-100"><ThumbsDown size={14} /></button>
                                                </div>
                                            </div>
                                            {expandedInsights.has(index) && (
                                                <div className="mt-2 p-3 bg-white dark:bg-slate-700 rounded-md text-xs italic">
                                                    {insight.reasoning[language]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('ai_automation.insights_generator.noResults')}</p>
                    )}
                </div>
            )}
        </AiCard>
    );
};

export default AIInsightsGenerator;