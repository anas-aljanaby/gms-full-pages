
import React, { useState } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { XIcon } from '../../../icons/GenericIcons';
import type { AdPlatformId } from '../../../../types';

interface CreateAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; platform: AdPlatformId }) => void;
}

const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [platform, setPlatform] = useState<AdPlatformId>('meta');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Campaign name is required.");
            return;
        }
        onCreate({ name, platform });
        setName('');
        setPlatform('meta');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('digital_marketing.advertising.createCampaign')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="ad-name" className="block text-sm font-medium">Campaign Name</label>
                            <input 
                                type="text" 
                                id="ad-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="ad-platform" className="block text-sm font-medium">Platform</label>
                            <select 
                                id="ad-platform"
                                value={platform}
                                onChange={e => setPlatform(e.target.value as AdPlatformId)}
                                className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="meta">Facebook & Instagram</option>
                                <option value="google">Google Ads</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="twitter">X (Twitter)</option>
                            </select>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark">Create Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdModal;
