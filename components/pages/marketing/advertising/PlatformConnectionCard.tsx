import React from 'react';
import type { AdPlatformAccount } from '../../../../types';
import { useLocalization } from '../../../../hooks/useLocalization';
import { formatNumber } from '../../../../lib/utils';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, YoutubeIcon, TiktokIcon } from '../../../icons/SocialMediaIcons';
import { GoogleAdsIcon } from '../../../icons/AdPlatformIcons';

const platformIcons: Record<string, React.FC<{className?: string}>> = {
    google: GoogleAdsIcon,
    meta: FacebookIcon,
    linkedin: LinkedinIcon,
    twitter: TwitterIcon,
    tiktok: TiktokIcon,
    youtube: YoutubeIcon,
};

const PlatformConnectionCard: React.FC<{ account: AdPlatformAccount }> = ({ account }) => {
    const { t, language } = useLocalization();
    const Icon = platformIcons[account.id];
    const isConnected = account.status === 'connected';

    const renderGrantStatus = () => {
        if (!account.adGrant) return null;
        const { status, budget, spend } = account.adGrant;
        const statusColors = {
            active: 'text-green-600 dark:text-green-400',
            suspended: 'text-red-600 dark:text-red-400',
            pending: 'text-yellow-600 dark:text-yellow-400',
            'not-enrolled': 'text-gray-500 dark:text-gray-400',
        };
        const percentage = budget > 0 ? (spend / budget) * 100 : 0;

        return (
            <div className="mt-2">
                <p className="text-xs font-semibold">{t('digital_marketing.advertising.googleAdGrants')}: <span className={statusColors[status]}>{t(`digital_marketing.advertising.platforms.grant_statuses.${status}`)}</span></p>
                {status === 'active' && (
                    <>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-slate-700 my-1">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500">{`$${formatNumber(spend, language)} / $${formatNumber(budget, language)}`}</p>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={`bg-card dark:bg-dark-card rounded-2xl shadow-soft border border-gray-200 dark:border-slate-700/50 p-4 flex flex-col justify-between transition-all hover:-translate-y-1 ${!isConnected && 'opacity-70'}`}>
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-8 h-8" />}
                        <span className="font-bold text-lg">{account.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {t(`digital_marketing.advertising.platforms.statuses.${account.status}`)}
                    </span>
                </div>
                
                {isConnected ? (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 truncate">{account.accountName} ({account.accountId})</p>
                        {renderGrantStatus()}
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <Metric label={t('digital_marketing.advertising.platforms.spend')} value={`$${formatNumber(account.metrics.spend, language)}`} />
                            <Metric label={t('digital_marketing.advertising.platforms.campaigns')} value={formatNumber(account.metrics.activeCampaigns, language)} />
                            <Metric label="CTR" value={`${account.metrics.ctr}%`} />
                            <Metric label="CVR" value={`${account.metrics.cvr}%`} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center mt-4">
                        <button className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg">
                            {t('digital_marketing.advertising.platforms.connect')}
                        </button>
                    </div>
                )}
            </div>
             <div className="mt-4 flex gap-2 text-xs font-semibold">
                <button disabled={!isConnected} className="flex-1 px-2 py-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50">{t('digital_marketing.advertising.platforms.viewCampaigns')}</button>
                <button disabled={!isConnected} className="flex-1 px-2 py-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50">{t('digital_marketing.advertising.platforms.manageAccount')}</button>
            </div>
        </div>
    );
};

const Metric: React.FC<{label: string; value: string | number}> = ({label, value}) => (
    <div>
        <span className="text-gray-500 dark:text-gray-400">{label}: </span>
        <span className="font-bold text-foreground dark:text-dark-foreground">{value}</span>
    </div>
);

export default PlatformConnectionCard;
