
import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Email } from '../../../types';
import { PlusCircleIcon } from '../../icons/GenericIcons';
import EmailDashboard from './email/EmailDashboard';

interface EmailMarketingTabProps {
    emails: Email[];
}

const EmailMarketingTab: React.FC<EmailMarketingTabProps> = ({ emails }) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    {t('digital_marketing.email.title')}
                </h2>
                <button 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                >
                    <PlusCircleIcon /> {t('digital_marketing.email.createEmail')}
                </button>
            </div>
            
            <EmailDashboard emails={emails} />
        </div>
    );
};

export default EmailMarketingTab;
