
import React, { useState } from 'react';
import type { Campaign, CampaignSegment } from '../../../../types';
import { useLocalization } from '../../../../hooks/useLocalization';
import { MOCK_CAMPAIGN_SEGMENTS } from '../../../../data/campaignsData';
import { UsersIcon, SegmentIcon, SlidersIcon, UploadCloudIcon } from '../../../icons/MarketingIcons';
import { formatNumber } from '../../../../lib/utils';


interface Step2AudienceProps {
    campaignData: Partial<Campaign>;
    updateData: (data: Partial<Campaign>) => void;
}

const AudienceSourceCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    details?: string;
}> = ({ title, description, icon, isSelected, onClick, details }) => (
    <div
        onClick={onClick}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
            isSelected 
                ? 'border-primary dark:border-secondary bg-primary-light/50 dark:bg-primary/10 shadow-lg' 
                : 'border-gray-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-secondary/50 hover:bg-gray-50 dark:hover:bg-slate-800/50'
        }`}
    >
        <div className="text-primary dark:text-secondary mx-auto w-12 h-12 flex items-center justify-center">{icon}</div>
        <h4 className="font-bold mt-2 text-foreground dark:text-dark-foreground">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        {details && <p className="text-xs font-semibold mt-1 text-gray-600 dark:text-gray-300">{details}</p>}
    </div>
);


const Step2Audience: React.FC<Step2AudienceProps> = ({ campaignData, updateData }) => {
    const { t, language } = useLocalization();
    const [source, setSource] = useState<'all' | 'segment' | 'new' | 'upload' | null>(null);

    const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const segmentId = e.target.value;
        const selectedSegment = MOCK_CAMPAIGN_SEGMENTS.find(s => s.id === segmentId);
        if (selectedSegment) {
            updateData({ audience: { name: selectedSegment.name, size: selectedSegment.contactCount } });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{t('digital_marketing.wizard.step2.title')}</h2>
                <p className="text-gray-500">{t('digital_marketing.wizard.step2.description')}</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">{t('digital_marketing.wizard.step2.source')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('digital_marketing.wizard.step2.sourceHelp')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AudienceSourceCard
                            title={t('digital_marketing.wizard.step2.allContacts')}
                            description={t('digital_marketing.wizard.step2.allContactsDesc')}
                            icon={<UsersIcon />}
                            isSelected={source === 'all'}
                            onClick={() => setSource('all')}
                            details={`~${formatNumber(15432, language)} contacts`}
                        />
                        <AudienceSourceCard
                            title={t('digital_marketing.wizard.step2.existingSegment')}
                            description={t('digital_marketing.wizard.step2.existingSegmentDesc')}
                            icon={<SegmentIcon />}
                            isSelected={source === 'segment'}
                            onClick={() => setSource('segment')}
                             details={`${MOCK_CAMPAIGN_SEGMENTS.length} segments available`}
                        />
                        <AudienceSourceCard
                            title={t('digital_marketing.wizard.step2.newSegment')}
                            description={t('digital_marketing.wizard.step2.newSegmentDesc')}
                            icon={<SlidersIcon />}
                            isSelected={source === 'new'}
                            onClick={() => setSource('new')}
                        />
                        <AudienceSourceCard
                            title={t('digital_marketing.wizard.step2.uploadList')}
                            description={t('digital_marketing.wizard.step2.uploadListDesc')}
                            icon={<UploadCloudIcon />}
                            isSelected={source === 'upload'}
                            onClick={() => setSource('upload')}
                        />
                    </div>
                 </div>
                 
                 {source === 'all' && (
                     <div className="p-3 bg-yellow-100/50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 text-sm rounded-r-lg animate-fade-in">
                        ⚠️ {t('digital_marketing.wizard.step2.allContactsWarning')}
                     </div>
                 )}

                 {source === 'segment' && (
                     <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg animate-fade-in">
                        <label className="block text-sm font-bold mb-2">{t('digital_marketing.wizard.step2.chooseSegment')}</label>
                        <div className="flex gap-2">
                             <select onChange={handleSegmentChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700">
                                <option>Select a segment...</option>
                                {MOCK_CAMPAIGN_SEGMENTS.map(seg => (
                                    <option key={seg.id} value={seg.id}>
                                        {seg.name} ({formatNumber(seg.contactCount, language)} contacts)
                                    </option>
                                ))}
                            </select>
                            <button className="px-3 py-2 text-sm font-semibold border rounded-md hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">{t('digital_marketing.wizard.step2.previewSegment')}</button>
                        </div>
                     </div>
                 )}

                 {source === 'new' && (
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-center animate-fade-in">
                        <p className="mb-4">Advanced segment builder will be here.</p>
                        <button className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
                            {t('digital_marketing.wizard.step2.buildSegment')}
                        </button>
                    </div>
                 )}
                 {source === 'upload' && (
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-center animate-fade-in">
                        <p className="mb-4">File upload component will be here.</p>
                      </div>
                 )}
            </div>
        </div>
    );
};

export default Step2Audience;