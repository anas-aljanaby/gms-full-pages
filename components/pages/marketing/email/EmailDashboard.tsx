
import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { MOCK_EMAIL_METRICS } from '../../../../data/emailMarketingData';
import MarketingMetricCard from '../MarketingMetricCard';
import RecentEmailsTable from './RecentEmailsTable';
import type { MarketingMetricId, Email } from '../../../../types';

interface EmailDashboardProps {
    emails: Email[];
}

const EmailDashboard: React.FC<EmailDashboardProps> = ({ emails }) => {
    const { t } = useLocalization();
    
    const metricIds: MarketingMetricId[] = [
        'totalSubscribers', 'deliverability', 'avgOpenRate', 'avgClickRate', 'emailConversions', 'unsubscribeRate'
    ];

    const metricsWithIds = MOCK_EMAIL_METRICS.map((metric, index) => ({
        ...metric,
        id: metricIds[index]
    }));

    return (
        <div className="space-y-8">
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {metricsWithIds.map(metric => (
                        <MarketingMetricCard key={metric.id} metric={metric as any} />
                    ))}
                </div>
            </section>
            
            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.email.recentEmails')}</h2>
                 <RecentEmailsTable emails={emails} />
            </section>
        </div>
    );
};

export default EmailDashboard;
