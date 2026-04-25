
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { SocialPost, Email, AdCampaign, AdCampaignStatus, AdPlatformId, EmailStatus } from '../../types';
import { MOCK_SOCIAL_POSTS } from '../../data/socialMediaData';
import { MOCK_RECENT_EMAILS } from '../../data/emailMarketingData';
import { MOCK_ACTIVE_CAMPAIGNS } from '../../data/advertisingData';
import Tabs from '../common/Tabs';
import MarketingDashboard from './marketing/MarketingDashboard';
import CampaignsTab from './marketing/CampaignsTab';
import PlaceholderPage from './PlaceholderPage';
import SocialMediaTab from './marketing/SocialMediaTab';
import EmailMarketingTab from './marketing/EmailMarketingTab';
import SmsWhatsappTab from './marketing/SmsWhatsappTab';
import WebsitePagesTab from './marketing/WebsitePagesTab';
import AdvertisingTab from './marketing/AdvertisingTab';
import CreatePostModal from './marketing/social/CreatePostModal';
import SendEmailModal from './marketing/email/SendEmailModal';
import CreateAdModal from './marketing/advertising/CreateAdModal';


const DigitalMarketing: React.FC = () => {
    const { t, language } = useLocalization();
    const [activeTab, setActiveTab] = useState('dashboard');

    // State for modals
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
    const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);
    const [composerInitialDate, setComposerInitialDate] = useState<Date | undefined>(undefined);

    // Lifted state for data
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
    const [emails, setEmails] = useState<Email[]>(MOCK_RECENT_EMAILS);
    const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(MOCK_ACTIVE_CAMPAIGNS);

    const handleCreatePost = (newPost: Omit<SocialPost, 'id'>) => {
        setSocialPosts(prev => [{ ...newPost, id: `post-${Date.now()}` }, ...prev]);
        setIsCreatePostModalOpen(false);
    };
    
    const handleSendEmail = (data: { to: string; subject: string; body: string }) => {
        const newEmail: Email = {
            id: `EMAIL-${Date.now()}`,
            name: { en: data.subject, ar: data.subject, tr: data.subject },
            subject: { en: data.subject, ar: data.subject, tr: data.subject },
            status: 'Sent',
            audience: { name: data.to, size: 1 },
            sentDate: new Date().toISOString(),
            stats: { sent: 1, delivered: 1, openRate: 0, clickRate: 0, conversions: 0 },
            createdBy: 'System User',
            createdAt: new Date().toISOString(),
        };
        setEmails(prev => [newEmail, ...prev]);
        setIsSendEmailModalOpen(false);
    };

    const handleCreateAd = (data: { name: string; platform: AdPlatformId }) => {
        const newAd: AdCampaign = {
            id: `AD-${Date.now()}`,
            name: data.name,
            platform: data.platform,
            type: 'Social',
            status: 'In Review',
            budget: { type: 'daily', amount: 50, spent: 0 },
            schedule: { start: new Date().toISOString(), end: 'Ongoing' },
            performance: { impressions: 0, clicks: 0, ctr: 0, conversions: 0, cvr: 0, cost: 0, cpa: 0 },
        };
        setAdCampaigns(prev => [newAd, ...prev]);
        setIsCreateAdModalOpen(false);
    };

    const openComposer = (date?: Date) => {
        setComposerInitialDate(date);
        setIsCreatePostModalOpen(true);
    };

    const tabs = [
        { id: 'dashboard', label: t('digital_marketing.tabs.dashboard') },
        { id: 'campaigns', label: t('digital_marketing.tabs.campaigns') },
        { id: 'social', label: t('digital_marketing.tabs.social') },
        { id: 'email', label: t('digital_marketing.tabs.email') },
        { id: 'sms_whatsapp', label: t('digital_marketing.tabs.sms_whatsapp') },
        { id: 'website', label: t('digital_marketing.tabs.website') },
        { id: 'content', label: t('digital_marketing.tabs.content') },
        { id: 'ads', label: t('digital_marketing.tabs.ads') },
        { id: 'analytics', label: t('digital_marketing.tabs.analytics') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <MarketingDashboard 
                            setActiveTab={setActiveTab}
                            onOpenCreatePostModal={() => openComposer()}
                            onOpenSendEmailModal={() => setIsSendEmailModalOpen(true)}
                            onOpenCreateAdModal={() => setIsCreateAdModalOpen(true)}
                        />;
            case 'campaigns':
                return <CampaignsTab />;
            case 'social':
                return <SocialMediaTab posts={socialPosts} openComposer={openComposer} />;
            case 'email':
                return <EmailMarketingTab emails={emails} />;
            case 'sms_whatsapp':
                return <SmsWhatsappTab />;
            case 'website':
                return <WebsitePagesTab />;
            case 'ads':
                return <AdvertisingTab campaigns={adCampaigns} onOpenCreateAdModal={() => setIsCreateAdModalOpen(true)} />;
            default:
                const moduleName = t(`digital_marketing.tabs.${activeTab}`);
                return (
                    <div className="mt-6">
                        <PlaceholderPage moduleKey={moduleName} />
                    </div>
                );
        }
    };

    return (
        <>
            <div className="animate-fade-in space-y-4">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                    {t('digital_marketing.title')}
                </h1>
                
                <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

                <div className="mt-2">
                    {renderContent()}
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setIsCreatePostModalOpen(false)}
                onCreatePost={handleCreatePost}
                initialDate={composerInitialDate}
            />
            <SendEmailModal
                isOpen={isSendEmailModalOpen}
                onClose={() => setIsSendEmailModalOpen(false)}
                onSend={handleSendEmail}
            />
            <CreateAdModal
                isOpen={isCreateAdModalOpen}
                onClose={() => setIsCreateAdModalOpen(false)}
                onCreate={handleCreateAd}
            />
        </>
    );
};

export default DigitalMarketing;
