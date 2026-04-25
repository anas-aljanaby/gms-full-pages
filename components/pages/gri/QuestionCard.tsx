import React from 'react';
import type { GRIQuestion } from '../../../data/griQuestionnaireData';
import { useLocalization } from '../../../hooks/useLocalization';

interface QuestionCardProps {
    question: GRIQuestion;
    answer: { value: any; skipped: boolean };
    onAnswerChange: (questionId: string, value: any) => void;
    onSkip: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answer, onAnswerChange, onSkip }) => {
    const { t } = useLocalization();
    const value = answer?.value || '';
    const isSkipped = answer?.skipped || false;

    const renderInput = () => {
        switch (question.questionType) {
            case 'currency':
            case 'number':
                return (
                    <div className="relative">
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => onAnswerChange(question.questionId, e.target.value)}
                            placeholder={t('questionnaire.answerHere')}
                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                        />
                         {question.questionType === 'currency' && <span className="absolute right-3 top-2.5 text-gray-400">TRY</span>}
                    </div>
                );
            case 'text':
            case 'mixed':
            default:
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onAnswerChange(question.questionId, e.target.value)}
                        placeholder={t('questionnaire.answerHere')}
                        rows={4}
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                    />
                );
        }
    };

    return (
        <div className={`p-4 border rounded-lg transition-all ${isSkipped ? 'bg-gray-100 dark:bg-slate-800/50 opacity-70' : 'bg-gray-50 dark:bg-slate-800/30'}`}>
            <label className="block font-semibold mb-1 text-foreground dark:text-dark-foreground" htmlFor={question.questionId}>
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{question.helpText}</p>
            
            {renderInput()}
            
            <div className="flex justify-end mt-2">
                <button onClick={() => onSkip(question.questionId)} className="text-xs font-semibold text-gray-500 hover:text-red-500">
                    {t('questionnaire.skip')}
                </button>
            </div>
        </div>
    );
};

export default QuestionCard;
