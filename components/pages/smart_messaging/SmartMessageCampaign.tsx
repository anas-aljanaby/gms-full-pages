
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Role, IndividualDonor, MessageType, GeneratedMessage, Language } from '../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { SmartMessageIcon } from '../../icons/ModuleIcons';
import { MOCK_INDIVIDUAL_DONORS } from '../../data/individualDonorsData';
import { MOCK_MESSAGE_TEMPLATES } from '../../data/smartMessagingData';
import { generatePersonalizedMessage } from '../../lib/smartMessaging';
import Spinner from '../../common/Spinner';
import DashboardStats from './smart_messaging/DashboardStats';
import CampaignTypeSelector from './smart_messaging/CampaignTypeSelector';
import TargetSelectionPanel from './smart_messaging/TargetSelectionPanel';
import CampaignConfigPanel from './smart_messaging/CampaignConfigPanel';
import LivePreviewPanel from './smart_messaging/LivePreviewPanel';
import GeneratedMessages from './smart_messaging/GeneratedMessages';
import { useToast } from '../../hooks/useToast';

const SmartMessageCampaign: React.FC<{ role: Role }> = ({ role }) => {
    const { t } = useLocalization();
    const toast = useToast();

    // Main state management
    const [campaignType, setCampaignType] = useState<MessageType | null>(null);
    const [targetDonors, setTargetDonors] = useState<IndividualDonor[]>([]);
    const [config, setConfig] = useState({
        timing: 'scheduleBest',
        channels: ['email'],
        personalizationLevel: 'Medium' as 'Low' | 'Medium' | 'High',
        language: 'auto' as 'auto' | Language,
    });
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState('');

    const handleGenerateMessages = async () => {
        if (targetDonors.length === 0 || !campaignType) {
            toast.showWarning('Please select a campaign type and target at least one donor.', { title: t('toasts.warningTitle') });
            return;
        }

        setIsLoading(true);
        setGeneratedMessages([]);
        const newMessages: GeneratedMessage[] = [];

        for (let i = 0; i < targetDonors.length; i++) {
            const donor = targetDonors[i];
            setLoadingProgress(t('smart_messaging.generate.progress', { current: i + 1, total: targetDonors.length }));
            try {
                const generated = await generatePersonalizedMessage(donor, campaignType, config.personalizationLevel, config.language, MOCK_MESSAGE_TEMPLATES);
                newMessages.push({
                    ...generated,
                    message_id: Date.now() + i,
                    created_at: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Failed to generate message for ${donor.fullName.en}:`, error);
                toast.showError(`Could not generate message for ${donor.fullName.en}.`, { title: t('toasts.errorTitle') });
            }
        }

        setGeneratedMessages(newMessages);
        setIsLoading(false);
        setLoadingProgress('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <SmartMessageIcon /> {t('sidebar.smart_message_campaign')}
            </h1>

            <DashboardStats generatedMessages={generatedMessages} />

            <CampaignTypeSelector selectedType={campaignType} onSelectType={setCampaignType} />
            
            {campaignType && (
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <TargetSelectionPanel 
                            allDonors={MOCK_INDIVIDUAL_DONORS}
                            onTargetsUpdate={setTargetDonors}
                            languageSelection={config.language}
                        />
                        <CampaignConfigPanel 
                            config={config}
                            onConfigChange={setConfig}
                            messageType={campaignType}
                        />
                        <button 
                            onClick={handleGenerateMessages}
                            disabled={isLoading || targetDonors.length === 0}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Spinner /> : '🚀'}
                            {isLoading ? loadingProgress : t('smart_messaging.generate.button')}
                        </button>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                        <LivePreviewPanel
                            targetDonors={targetDonors}
                            campaignType={campaignType}
                            personalizationLevel={config.personalizationLevel}
                            languageSelection={config.language}
                        />
                    </div>
                 </div>
            )}
            
            {generatedMessages.length > 0 && !isLoading && (
                 <GeneratedMessages messages={generatedMessages} />
            )}

        </div>
    );
};

export default SmartMessageCampaign;
