import React, { useState } from 'react';
import AiCard from './AiCard';
import { WorkflowOptIcon } from '../../icons/AiIcons';
import { PlusCircleIcon, SparklesIcon } from '../../icons/GenericIcons';
import { useLocalization } from '../../../hooks/useLocalization';

const WorkflowBuilder = () => {
    const { t } = useLocalization();
    
    const [workflows, setWorkflows] = useState([
        { name: t('ai_automation.workflow_automation.newDonorWelcome'), trigger: t('ai_automation.workflow_automation.newDonorTrigger'), action: t('ai_automation.workflow_automation.sendWelcomeEmailAction') },
    ]);
    const [currentTrigger, setCurrentTrigger] = useState('');
    const [currentAction, setCurrentAction] = useState('');

    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.workflow_automation.myWorkflows')} icon={<WorkflowOptIcon className="w-6 h-6" />}>
                <div className="space-y-3">
                    {workflows.map((wf, index) => (
                        <div key={index} className="p-4 border dark:border-slate-700 rounded-lg flex items-center justify-between">
                            <span className="font-semibold">{wf.name}</span>
                            <button className="text-sm text-primary hover:underline">{t('ai_automation.workflow_automation.edit')}</button>
                        </div>
                    ))}
                </div>
            </AiCard>

            <AiCard title={t('ai_automation.workflow_automation.createNewWorkflow')} icon={<PlusCircleIcon />}>
                <div className="space-y-6">
                    {/* Step 1: Trigger */}
                    <div>
                        <label className="block text-sm font-bold mb-2">{t('ai_automation.workflow_automation.triggerLabel')}</label>
                        <select
                            value={currentTrigger}
                            onChange={e => setCurrentTrigger(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="">{t('ai_automation.workflow_automation.selectTrigger')}</option>
                            <option value="newDonor">{t('ai_automation.workflow_automation.triggers.newDonor')}</option>
                            <option value="newDonation">{t('ai_automation.workflow_automation.triggers.newDonation')}</option>
                            <option value="projectStatusUpdate">{t('ai_automation.workflow_automation.triggers.projectStatusUpdate')}</option>
                        </select>
                    </div>

                    {/* Step 2: Action */}
                    {currentTrigger && (
                        <div>
                            <label className="block text-sm font-bold mb-2">{t('ai_automation.workflow_automation.actionLabel')}</label>
                            <select
                                value={currentAction}
                                onChange={e => setCurrentAction(e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="">{t('ai_automation.workflow_automation.selectAction')}</option>
                                <option value="sendEmail">{t('ai_automation.workflow_automation.actions.sendEmail')}</option>
                                <option value="createTask">{t('ai_automation.workflow_automation.actions.createTask')}</option>
                                <option value="notifyUser">{t('ai_automation.workflow_automation.actions.notifyUser')}</option>
                            </select>
                        </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-primary-light/50 dark:bg-primary/10 rounded-lg flex items-start gap-3">
                        <SparklesIcon className="w-5 h-5 text-primary dark:text-secondary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-primary-dark dark:text-secondary-light">
                            <span className="font-bold">{t('ai_automation.workflow_automation.aiSuggestion')}:</span> {t('ai_automation.workflow_automation.aiSuggestionText')}
                        </p>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button className="px-6 py-2.5 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
                            {t('ai_automation.workflow_automation.saveWorkflow')}
                        </button>
                    </div>
                </div>
            </AiCard>
        </div>
    );
};

export default WorkflowBuilder;
