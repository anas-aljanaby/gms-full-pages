import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { MOCK_SOCIAL_ACCOUNTS, MOCK_SOCIAL_PERFORMANCE_METRICS } from '../../../../data/socialMediaData';
import AccountCard from './AccountCard';
import MarketingMetricCard from '../MarketingMetricCard';

const SocialDashboard: React.FC = () => {
    const { t } = useLocalization();
    
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.social.connectedAccounts')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_SOCIAL_ACCOUNTS.map(account => (
                        <AccountCard key={account.id} account={account} />
                    ))}
                </div>
            </section>
            
            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.social.performanceMetrics')}</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_SOCIAL_PERFORMANCE_METRICS.map(metric => (
                        <MarketingMetricCard key={metric.id} metric={metric} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SocialDashboard;