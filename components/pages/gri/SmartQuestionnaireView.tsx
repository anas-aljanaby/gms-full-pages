



import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { sampleGRIQuestions, GRIQuestion } from '../../../data/griQuestionnaireData';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import QuestionCard from './QuestionCard';

interface SmartQuestionnaireViewProps {
    onBack: () => void;
}

interface AnswersState {
    [questionId: string]: {
        value: any;
        skipped: boolean;
    };
}

const SmartQuestionnaireView: React.FC<SmartQuestionnaireViewProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const toast = useToast();
    const [answers, setAnswers] = useState<AnswersState>({});
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const questions = sampleGRIQuestions;

    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, q) => {
            const category = q.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(q);
            return acc;
        }, {} as Record<string, GRIQuestion[]>);
    }, [questions]);
    
    const categoryOrder: (keyof typeof groupedQuestions)[] = ['organizational', 'economic', 'social'];


    const handleAnswerChange = useCallback((questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { value, skipped: false }
        }));
    }, []);

    const handleSkip = useCallback((questionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { value: '', skipped: true }
        }));
    }, []);

    const handleSave = () => {
        console.log("Saving answers:", answers);
        toast.showSuccess(t('questionnaire.saveSuccess'));
        onBack();
    };
    
    // FIX: Replaced Object.values() with Object.keys() to ensure correct type inference and prevent errors when accessing answer properties.
    const answeredCount = Object.keys(answers).filter(key => {
        const answer = answers[key];
        return answer && !answer.skipped && answer.value;
    }).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('questionnaire.title')}</h1>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('questionnaire.backToAnalysis')}
                </button>
            </div>

            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
                <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>{t('questionnaire.progress')}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="space-y-4">
                {categoryOrder.map(category => {
                    const categoryQuestions = groupedQuestions[category];
                    if (!categoryQuestions) return null;

                    return (
                        // FIX: Wrapped key prop in String() to prevent implicit symbol-to-string conversion errors at runtime.
                        <div key={String(category)} className="bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700 overflow-hidden">
                            <button
                                // FIX: Use String() for category when comparing with string state.
                                onClick={() => setOpenAccordion(openAccordion === String(category) ? null : String(category))}
                                className="w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-dark-card/50"
                            >
                                {/* FIX: The 'category' variable was implicitly converted to a string in a template literal, which can cause a runtime error if it's a symbol. Wrapped it in String() to ensure type safety. */}
                                <h3 className="font-bold text-lg capitalize">{t(`questionnaire.category.${String(category)}`)}</h3>
                                {/* FIX: Corrected accordion chevron animation logic. */}
                                {/* FIX: Use String() for category when comparing with string state. */}
                                <motion.div animate={{ rotate: openAccordion === String(category) ? 180 : 0 }}>
                                    <ChevronDown />
                                </motion.div>
                            </button>
                             <AnimatePresence>
                                {/* FIX: Use String() for category when comparing with string state. */}
                                {openAccordion === String(category) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 space-y-4">
                                            {categoryQuestions.map(q => (
                                                <QuestionCard 
                                                    key={q.questionId}
                                                    question={q}
                                                    answer={answers[q.questionId]}
                                                    onAnswerChange={handleAnswerChange}
                                                    onSkip={handleSkip}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="text-center">
                <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors"
                >
                    {t('questionnaire.saveAnswers')}
                </button>
            </div>
        </div>
    );
};

export default SmartQuestionnaireView;