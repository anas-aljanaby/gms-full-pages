import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { MOCK_SMS_CHANNEL_STATS, MOCK_WHATSAPP_CHANNEL_STATS, MOCK_SMS_WHATSAPP_CAMPAIGNS } from '../../../../data/smsWhatsappData';
import ChannelCard from './ChannelCard';
import RecentMessagingCampaignsTable from './RecentMessagingCampaignsTable';

const SmsWhatsappDashboard: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChannelCard channel="sms" data={MOCK_SMS_CHANNEL_STATS} />
                <ChannelCard channel="whatsapp" data={MOCK_WHATSAPP_CHANNEL_STATS} />
            </div>
            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.sms_whatsapp.recentCampaigns')}</h2>
                 <RecentMessagingCampaignsTable campaigns={MOCK_SMS_WHATSAPP_CAMPAIGNS} />
            </section>
        </div>
    );
};

export default SmsWhatsappDashboard;
