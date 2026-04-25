import React, { useState } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { LandingPageType } from '../../../../types';
import { XIcon } from '../../../icons/GenericIcons';

interface CreatePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, type: LandingPageType) => void;
}

const CreatePageModal: React.FC<CreatePageModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [type, setType] = useState<LandingPageType>('General');
    
    const pageTypes: LandingPageType[] = ['Donation', 'Event', 'Volunteer', 'Newsletter', 'Petition', 'General'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Page name is required.");
            return;
        }
        onCreate(name, type);
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
                        {t('digital_marketing.website_pages.createPage')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="page-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('digital_marketing.website_pages.form.pageName')}</label>
                            <input 
                                type="text" 
                                id="page-name" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                required 
                                className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                                placeholder="e.g., Ramadan 2025 Campaign"
                            />
                        </div>
                        <div>
                            <label htmlFor="page-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('digital_marketing.website_pages.form.pageType')}</label>
                            <select 
                                id="page-type"
                                value={type}
                                onChange={e => setType(e.target.value as LandingPageType)}
                                className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            >
                                {pageTypes.map(pt => (
                                    <option key={pt} value={pt}>{t(`digital_marketing.website_pages.types.${pt}`)}</option>
                                ))}
                            </select>
                        </div>
                         <div className="pt-4 text-center text-gray-500">
                            <p className="font-semibold">{t('digital_marketing.website_pages.nextStep')}</p>
                            <p className="text-sm">{t('digital_marketing.website_pages.builderComingSoon')}</p>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary-dark">{t('digital_marketing.website_pages.createAndEdit')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePageModal;
