
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_CAMPAIGNS } from '../../../data/campaignsData';
import type { Campaign, SortDirection } from '../../../types';
import CampaignsDashboard from './CampaignsDashboard';
import CampaignsTable from './CampaignsTable';
import CreateCampaignWizard from './CreateCampaignWizard';

const CampaignsTab: React.FC = () => {
    const { t, language } = useLocalization();
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof Campaign | null>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    
    // In a real app, filters would be more complex. Using a simple string for now.
    const [quickFilter, setQuickFilter] = useState('all');

    const filteredAndSortedCampaigns = useMemo(() => {
        let filtered = campaigns.filter(campaign => {
            const searchLower = searchTerm.toLowerCase();
            const name = campaign.name[language] || campaign.name.en;
            return name.toLowerCase().includes(searchLower) ||
                   campaign.owner.toLowerCase().includes(searchLower);
        });

        if (quickFilter !== 'all') {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(c => {
                switch(quickFilter) {
                    case 'active': return c.status === 'Active';
                    case 'endingSoon': 
                        const endDate = new Date(c.endDate);
                        return c.status === 'Active' && endDate > now && endDate <= thirtyDaysFromNow;
                    case 'overBudget': return c.spent > c.budget;
                    default: return true;
                }
            });
        }

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (sortColumn === 'name') {
                    const aName = a.name[language] || a.name.en;
                    const bName = b.name[language] || b.name.en;
                    return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                     if (sortColumn === 'startDate' || sortColumn === 'endDate' || sortColumn === 'createdAt') {
                        return sortDirection === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
                    }
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }

                return 0;
            });
        }
        
        return filtered;
    }, [campaigns, searchTerm, sortColumn, sortDirection, language, quickFilter]);
    
    const handleSort = useCallback((column: keyof Campaign) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);


    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <CampaignsDashboard 
                    campaigns={campaigns} 
                    activeFilter={quickFilter}
                    onFilterChange={setQuickFilter}
                    onOpenWizard={() => setIsWizardOpen(true)}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('digital_marketing.campaigns.title')}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Add search and other controls here if needed, or keep in table component */}
                    </div>
                </div>

                <CampaignsTable 
                    campaigns={filteredAndSortedCampaigns}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />
            </div>
            <CreateCampaignWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
        </>
    );
};

export default CampaignsTab;
