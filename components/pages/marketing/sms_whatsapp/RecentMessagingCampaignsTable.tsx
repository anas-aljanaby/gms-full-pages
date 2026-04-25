import React, { useState } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { MessagingCampaign } from '../../../../types';
import { formatDate, formatCurrency, formatNumber } from '../../../../lib/utils';
import { MoreHorizontalIcon } from '../../../icons/GenericIcons';
import { SmsIcon, WhatsappIcon } from '../../../icons/MarketingIcons';

interface RecentMessagingCampaignsTableProps {
    campaigns: MessagingCampaign[];
}

const RecentMessagingCampaignsTable: React.FC<RecentMessagingCampaignsTableProps> = ({ campaigns }) => {
    const { t, language } = useLocalization();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const paginatedCampaigns = campaigns.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(campaigns.length / rowsPerPage);

    const ChannelBadge: React.FC<{ channel: 'sms' | 'whatsapp' }> = ({ channel }) => {
        const isSms = channel === 'sms';
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${isSms ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                {isSms ? <SmsIcon className="w-4 h-4 text-blue-500" /> : <WhatsappIcon className="w-4 h-4 text-green-600" />}
                {channel.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.campaignName')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.sentDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.recipients')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.delivered')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.readOpened')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.responded')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.optOuts')}</th>
                            <th scope="col" className="px-6 py-3">{t('digital_marketing.sms_whatsapp.table.cost')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('digital_marketing.sms_whatsapp.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCampaigns.map(campaign => (
                            <tr key={campaign.id} className="bg-card dark:bg-dark-card border-b dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <ChannelBadge channel={campaign.channel} />
                                        <p className="font-bold text-foreground dark:text-dark-foreground">{campaign.name[language]}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {campaign.sentDate ? formatDate(campaign.sentDate, language) : (campaign.scheduledDate ? formatDate(campaign.scheduledDate, language) : 'N/A')}
                                    <p className="text-xs">{campaign.status}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p>{formatNumber(campaign.recipients.count, language)}</p>
                                    <p className="text-xs truncate max-w-[100px]">{campaign.recipients.listName}</p>
                                </td>
                                <td className="px-6 py-4">{formatNumber(campaign.delivered.count, language)} ({campaign.delivered.rate}%)</td>
                                <td className="px-6 py-4">{campaign.read ? `${formatNumber(campaign.read.count, language)} (${campaign.read.rate}%)` : t('digital_marketing.sms_whatsapp.table.na')}</td>
                                <td className="px-6 py-4">{formatNumber(campaign.responded.count, language)} ({campaign.responded.rate}%)</td>
                                <td className="px-6 py-4">{formatNumber(campaign.optOuts.count, language)} ({campaign.optOuts.rate}%)</td>
                                <td className="px-6 py-4">{formatCurrency(campaign.cost.total, language)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontalIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {campaigns.length === 0 && <div className="text-center py-16 text-gray-500">{t('individual_donors.noResults')}</div>}
            </div>
             <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, campaigns.length)}-{Math.min(currentPage * rowsPerPage, campaigns.length)}</span> of <span className="font-semibold">{campaigns.length}</span></span>
                <ul className="inline-flex items-center -space-x-px">
                    <li><button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight border rounded-l-lg disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-700">{t('common.previous')}</button></li>
                    <li><button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight border rounded-r-lg disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-700">{t('common.next')}</button></li>
                </ul>
            </nav>
        </div>
    );
};

export default RecentMessagingCampaignsTable;
