import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLocalization } from '../../../hooks/useLocalization';
import { USER_ROLES, SIDEBAR_MODULES } from '../../../constants';
import AiCard from './AiCard';
import { WorkflowOptIcon } from '../../icons/AiIcons';
import Spinner from '../../common/Spinner';

const UserFlowWorkshop: React.FC = () => {
    const { t } = useLocalization();
    const [role, setRole] = useState('Staff');
    const [goal, setGoal] = useState('');
    const [generatedFlow, setGeneratedFlow] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        setGeneratedFlow(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const moduleNames = SIDEBAR_MODULES.map(m => t(`sidebar.${m.key}`)).join(', ');
            
            const systemInstruction = `You are an expert UX designer for a non-profit ERP system. The system has these modules: ${moduleNames}. Your task is to generate a step-by-step user flow based on a role and a goal. The flow should be a simple, clear, numbered list of actions. Each step must be on a new line. Do not add any introductory or concluding sentences outside of the numbered list.`;
            const userPrompt = `Generate the user flow for a user with the role of "${role}" whose goal is to "${goal}". The user starts from the main dashboard.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: { systemInstruction },
            });

            const text = response.text;
            const steps = text
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^\d+\.\s*|^\*\s*/.test(line))
                .map(line => line.replace(/^\d+\.\s*|^\*\s*/, '').trim());

            if (steps.length === 0) {
                setError("The AI couldn't generate a valid flow. Please try rephrasing your goal.");
            } else {
                setGeneratedFlow(steps);
            }
        } catch (err) {
            console.error("Error generating user flow:", err);
            setError("An error occurred while communicating with the AI. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.user_flow_workshop.title')} icon={<WorkflowOptIcon className="w-6 h-6" />}>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('ai_automation.user_flow_workshop.description')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('ai_automation.user_flow_workshop.roleLabel')}</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                            {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">{t('ai_automation.user_flow_workshop.goalLabel')}</label>
                        <textarea 
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            rows={3}
                            placeholder={t('ai_automation.user_flow_workshop.goalPlaceholder')}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={handleGenerate} disabled={isLoading || !goal.trim()} className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? <Spinner size="w-5 h-5" /> : t('ai_automation.user_flow_workshop.generateButton')}
                    </button>
                </div>
            </AiCard>

            {isLoading && <div className="flex justify-center py-10"><Spinner text={t('common.generating')} /></div>}
            {error && <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}

            {generatedFlow && (
                <AiCard title={t('ai_automation.user_flow_workshop.resultTitle')}>
                    <div className="flex flex-col items-center">
                        {generatedFlow.map((step, index) => (
                            <React.Fragment key={index}>
                                <div className="flex items-center w-full max-w-lg">
                                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-lg z-10">{index + 1}</div>
                                    <div className="flex-grow p-4 ms-[-1rem] ps-6 bg-gray-100 dark:bg-slate-800/50 rounded-e-lg border-s-4 border-primary">
                                        <p className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                </div>
                                {index < generatedFlow.length - 1 && (
                                    <div className="w-1 h-12 bg-gray-200 dark:bg-slate-700" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </AiCard>
            )}
        </div>
    );
};
export default UserFlowWorkshop;