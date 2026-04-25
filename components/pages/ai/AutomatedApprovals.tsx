import React from 'react';
import AiCard from './AiCard';
import { ComplianceIcon, WorkflowOptIcon } from '../../icons/AiIcons';
import { useLocalization } from '../../../hooks/useLocalization';

const AutomatedApprovals = () => {
    const { t } = useLocalization();

    const approvals = [
        { id: 1, type: t('ai_automation.automated_approvals.types.pr'), amount: '$7,500', submitter: 'John Doe', rule: t('ai_automation.automated_approvals.rules.gt5000') },
        { id: 2, type: t('ai_automation.automated_approvals.types.ec'), amount: '$320', submitter: 'Jane Smith', rule: t('ai_automation.automated_approvals.rules.expenseClaim') },
        { id: 3, type: t('ai_automation.automated_approvals.types.vp'), amount: '$12,000', submitter: 'Finance Bot', rule: t('ai_automation.automated_approvals.rules.gt10000') },
    ];

    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.automated_approvals.queueTitle')} icon={<ComplianceIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    {approvals.map(item => (
                        <div key={item.id} className="p-4 border dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <h4 className="font-bold text-foreground dark:text-dark-foreground">{item.type} - {item.amount}</h4>
                                    <p className="text-sm text-gray-500">{t('ai_automation.automated_approvals.submittedBy')}: {item.submitter}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button className="px-3 py-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg">{t('ai_automation.automated_approvals.approve')}</button>
                                    <button className="px-3 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">{t('ai_automation.automated_approvals.reject')}</button>
                                    <button className="px-3 py-1.5 text-sm font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">{t('ai_automation.automated_approvals.comment')}</button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t dark:border-slate-600 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <WorkflowOptIcon className="w-4 h-4" />
                                <span><span className="font-semibold">{t('ai_automation.automated_approvals.rule')}:</span> {item.rule}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </AiCard>
        </div>
    );
};

export default AutomatedApprovals;
