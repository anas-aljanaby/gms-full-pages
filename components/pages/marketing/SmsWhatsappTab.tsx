import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import SmsWhatsappDashboard from './sms_whatsapp/SmsWhatsappDashboard';

const SmsWhatsappTab: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    {t('digital_marketing.sms_whatsapp.title')}
                </h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        {t('digital_marketing.sms_whatsapp.sendSms')}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors">
                        {t('digital_marketing.sms_whatsapp.sendWhatsapp')}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                        {t('digital_marketing.sms_whatsapp.createTemplate')}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                        {t('digital_marketing.sms_whatsapp.inbox')}
                    </button>
                </div>
            </div>
            
            <SmsWhatsappDashboard />
        </div>
    );
};

export default SmsWhatsappTab;
