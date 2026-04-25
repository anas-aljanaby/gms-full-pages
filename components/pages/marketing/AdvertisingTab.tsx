
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { PlusCircleIcon, ChevronDownIcon } from '../../icons/GenericIcons';
import { MOCK_PLATFORM_ACCOUNTS, MOCK_OVERALL_PERFORMANCE } from '../../../data/advertisingData';
import PlatformConnectionCard from './advertising/PlatformConnectionCard';
import OverallPerformanceCard from './advertising/OverallPerformanceCard';
import ActiveCampaignsTable from './advertising/ActiveCampaignsTable';
import type { AdCampaign, SortDirection } from '../../../types';

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
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenCreateAdModal(); setIsOpen(false); }} role="menuitem" className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.advertising.facebookInstagramCampaign')}</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenCreateAdModal(); setIsOpen(false); }} role="menuitem" className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">{t('digital_marketing.advertising.linkedinCampaign')}</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface AdvertisingTabProps {
    campaigns: AdCampaign[];
    onOpenCreateAdModal: () => void;
}

const AdvertisingTab: React.FC<AdvertisingTabProps> = ({ campaigns, onOpenCreateAdModal }) => {
    const { t } = useLocalization();
    
    return (
        <div className="space-y-8 animate-fade-in">
            <DashboardHeader onOpenCreateAdModal={onOpenCreateAdModal} />

            <section>
                <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.platforms.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PLATFORM_ACCOUNTS.map(acc => <PlatformConnectionCard key={acc.id} account={acc} />)}
                </div>
            </section>
            
            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.summary.title')}</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <OverallPerformanceCard type="spend" data={MOCK_OVERALL_PERFORMANCE} platforms={MOCK_PLATFORM_ACCOUNTS} />
                    <OverallPerformanceCard type="impressions" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="clicks" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="conversions" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="cost_metrics" data={MOCK_OVERALL_PERFORMANCE} />
                    <OverallPerformanceCard type="ranking" data={MOCK_PLATFORM_ACCOUNTS} />
                 </div>
            </section>

            <section>
                 <h2 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('digital_marketing.advertising.active_campaigns.title')}</h2>
                 <ActiveCampaignsTable campaigns={campaigns} />
            </section>
        </div>
    );
};

export default AdvertisingTab;
