

import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { PlusCircleIcon, ChevronDownIcon } from '../../../icons/GenericIcons';

// FIX: Added onOpenCreateAdModal to props to handle click events.
const DashboardHeader: React.FC<{onOpenCreateAdModal: () => void}> = ({onOpenCreateAdModal}) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                {t('digital_marketing.advertising.title')}
            </h1>
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                >
                    <PlusCircleIcon /> 
                    {t('digital_marketing.advertising.createCampaign')}
                    <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="origin-top-right absolute end-0 mt-2 w-56 rounded-md shadow-lg bg-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-10 animate-scale-in-fast">
                        <div className="py-1" role="menu">
                            {/* FIX: Call onOpenCreateAdModal when a menu item is clicked. */}
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenCreateAdModal(); setIsOpen(false); }} role="menuitem" className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.advertising.googleAdsCampaign')}</a>
                            {/* FIX: Call onOpenCreateAdModal when a menu item is clicked. */}
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenCreateAdModal(); setIsOpen(false); }} role="menuitem" className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.advertising.facebookInstagramCampaign')}</a>
                            {/* FIX: Call onOpenCreateAdModal when a menu item is clicked. */}
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenCreateAdModal(); setIsOpen(false); }} role="menuitem" className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.advertising.linkedinCampaign')}</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardHeader;