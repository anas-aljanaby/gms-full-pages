import React, { useState, useCallback, useMemo } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { AdCampaign, SortDirection, AdPlatformId } from '../../../../types';
import { formatDate, formatCurrency } from '../../../../lib/utils';
import { MoreHorizontalIcon, ChevronDownIcon } from '../../../icons/GenericIcons';
import AdCampaignStatusBadge from './AdCampaignStatusBadge';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, YoutubeIcon, TiktokIcon } from '../../../icons/SocialMediaIcons';
import { GoogleAdsIcon } from '../../../icons/AdPlatformIcons';

interface ActiveCampaignsTableProps {
    campaigns: AdCampaign[];
}

const platformIcons: Record<AdPlatformId, React.FC<{ className?: string }>> = {
    google: GoogleAdsIcon,
    meta: FacebookIcon,
    linkedin: LinkedinIcon,
    twitter: TwitterIcon,
    tiktok: TiktokIcon,
    youtube: YoutubeIcon,
};

const ActiveCampaignsTable: React.FC<ActiveCampaignsTableProps> = ({ campaigns: initialCampaigns }) => {
    const { t, language } = useLocalization();
    const [campaigns, setCampaigns] = useState<AdCampaign[]>(initialCampaigns);
    const [sortColumn, setSortColumn] = useState<keyof AdCampaign | null>('performance');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

     const handleSort = useCallback((column: keyof AdCampaign) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    const sortedCampaigns = useMemo(() => {
        let sorted = [...campaigns];
        if (sortColumn) {
            sorted.sort((a, b) => {
                let aVal: any = a[sortColumn];
                let bVal: any = b[sortColumn];

                if (sortColumn === 'performance') {
                    aVal = a.performance.roas || 0;
                    bVal = b.performance.roas || 0;
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                return 0;
            });
        }
        return sorted;
    }, [campaigns, sortColumn, sortDirection]);


    const SortableHeader: React.FC<{ column: keyof AdCampaign, labelKey: string }> = ({ column, labelKey }) => (
        <th scope="col" className="px-4 py-3">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort(column)}>
                {t(labelKey)}
                {sortColumn === column && (
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
            </div>
        </th>
    );

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('digital_marketing.advertising.active_campaigns.name')}</th>
                            <SortableHeader column="status" labelKey="digital_marketing.advertising.active_campaigns.status" />
                            <th scope="col" className="px-4 py-3">{t('digital_marketing.advertising.active_campaigns.budget')}</th>
                            <th scope="col" className="px-4 py-3">{t('digital_marketing.advertising.active_campaigns.performance')}</th>
                            <SortableHeader column="performance" labelKey="digital_marketing.advertising.active_campaigns.roas" />
                            <th scope="col" className="px-4 py-3 text-right">{t('digital_marketing.advertising.active_campaigns.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCampaigns.map(campaign => {
                            const PlatformIcon = platformIcons[campaign.platform];
                            const budgetProgress = (campaign.budget.spent / campaign.budget.amount) * 100;
                            return (
                                <tr key={campaign.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-foreground dark:text-dark-foreground">{campaign.name}</p>
                                                <p className="text-xs text-gray-500">{campaign.type} Campaign</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4"><AdCampaignStatusBadge status={campaign.status} /></td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold">{formatCurrency(campaign.budget.spent, language)} / {formatCurrency(campaign.budget.amount, language)}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-slate-700 mt-1">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${budgetProgress}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs">
                                        <p>Clicks: {campaign.performance.clicks} ({campaign.performance.ctr}%)</p>
                                        <p>Conv: {campaign.performance.conversions} ({campaign.performance.cvr}%)</p>
                                        <p>CPA: {formatCurrency(campaign.performance.cpa, language)}</p>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-lg">
                                        <span className={ (campaign.performance.roas || 0) >= 1 ? 'text-green-500' : 'text-red-500'}>
                                            {campaign.performance.roas ? `${campaign.performance.roas.toFixed(1)}x` : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActiveCampaignsTable;
