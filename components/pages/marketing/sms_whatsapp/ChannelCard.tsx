import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { formatNumber } from '../../../../lib/utils';
import { SmsIcon, WhatsappIcon } from '../../../icons/MarketingIcons';

interface ChannelCardProps {
    channel: 'sms' | 'whatsapp';
    data: any;
}

const MetricItem: React.FC<{ label: string; value: string; trend?: number; note?: string }> = ({ label, value, trend, note }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-lg font-bold text-foreground dark:text-dark-foreground">{value}</span>
        </div>
        {trend && (
             <p className={`text-xs font-bold text-right ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </p>
        )}
    </div>
);

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, data }) => {
    const { t, language } = useLocalization();
    const isSms = channel === 'sms';
    const Icon = isSms ? SmsIcon : WhatsappIcon;
    const theme = isSms 
        ? { name: t('digital_marketing.sms_whatsapp.smsChannel'), color: 'blue', button: 'bg-primary text-white hover:bg-primary-dark' }
        : { name: t('digital_marketing.sms_whatsapp.whatsappChannel'), color: 'green', button: 'bg-green-600 text-white hover:bg-green-700' };

    const status = isSms ? (data.provider ? 'active' : 'notConfigured') : (data.qualityRating ? 'verified' : 'notConfigured');

    return (
        <div className={`bg-card dark:bg-dark-card rounded-2xl shadow-soft border-t-4 ${isSms ? 'border-blue-500' : 'border-green-500'}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Icon />
                        <h3 className="text-xl font-bold">{theme.name}</h3>
                    </div>
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'active' || status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                        {t(`digital_marketing.sms_whatsapp.${status}`)}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <MetricItem label={t('digital_marketing.sms_whatsapp.messagesSent')} value={formatNumber(data.messagesSent, language)} />
                    <MetricItem label={t('digital_marketing.sms_whatsapp.deliveryRate')} value={`${data.deliveryRate}%`} />
                    {!isSms && <MetricItem label={t('digital_marketing.sms_whatsapp.readRate')} value={`${data.readRate}%`} />}
                    <MetricItem label={t('digital_marketing.sms_whatsapp.responseRate')} value={`${data.responseRate}%`} />
                    <MetricItem label={t('digital_marketing.sms_whatsapp.optOutRate')} value={`${data.optOutRate}%`} />
                </div>
                
                <div className="mt-4 pt-4 border-t dark:border-slate-700 text-sm space-y-2">
                    {isSms ? (
                        <>
                            <p><strong>{t('digital_marketing.sms_whatsapp.provider')}:</strong> {data.provider}</p>
                            <p><strong>{t('digital_marketing.sms_whatsapp.balance')}:</strong> ${data.balance.toFixed(2)}</p>
                        </>
                    ) : (
                        <>
                             <p><strong>{t('digital_marketing.sms_whatsapp.qualityRating')}:</strong> <span className="font-bold text-green-600">{data.qualityRating}</span></p>
                             <p><strong>{t('digital_marketing.sms_whatsapp.templates')}:</strong> {data.templates.approved} {t('digital_marketing.sms_whatsapp.approved')}, {data.templates.pending} {t('digital_marketing.sms_whatsapp.pending')}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex flex-wrap gap-2 justify-end">
                 <button className="px-3 py-1.5 text-xs font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.sms_whatsapp.viewReports')}</button>
                 <button className="px-3 py-1.5 text-xs font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.sms_whatsapp.viewInbox')}</button>
                 <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${theme.button}`}>
                    {isSms ? t('digital_marketing.sms_whatsapp.sendSms') : t('digital_marketing.sms_whatsapp.sendWhatsapp')}
                </button>
            </div>
        </div>
    );
};

export default ChannelCard;
