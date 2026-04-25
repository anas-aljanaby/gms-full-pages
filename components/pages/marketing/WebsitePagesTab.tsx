import React, { useState, useMemo, useCallback } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_LANDING_PAGES, MOCK_LANDING_PAGE_KPIS } from '../../../data/landingPagesData';
import type { LandingPage, SortDirection, LandingPageType } from '../../../types';
import { PlusCircleIcon } from '../../icons/GenericIcons';
import LandingPageKpiCard from './landing_pages/LandingPageKpiCard';
import LandingPagesTable from './landing_pages/LandingPagesTable';
import CreatePageModal from './landing_pages/CreatePageModal';

const WebsitePagesTab: React.FC = () => {
    const { t } = useLocalization();
    const [pages, setPages] = useState<LandingPage[]>(MOCK_LANDING_PAGES);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof LandingPage | null>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredAndSortedPages = useMemo(() => {
        let filtered = pages.filter(page =>
            page.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                
                if (sortColumn === 'performance') {
                    // Example: sort by conversion rate
                    const aPerf = a.performance.conversionRate;
                    const bPerf = b.performance.conversionRate;
                    return sortDirection === 'asc' ? aPerf - bPerf : bPerf - aPerf;
                }

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                     if (sortColumn === 'createdAt' || sortColumn === 'updatedAt') {
                        return sortDirection === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
                    }
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                return 0;
            });
        }
        return filtered;
    }, [pages, searchTerm, sortColumn, sortDirection]);
    
    const handleSort = useCallback((column: keyof LandingPage) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    const handleCreatePage = (name: string, type: LandingPageType) => {
        // Mock creation logic
        const newPage: LandingPage = {
            id: `lp-${Date.now()}`,
            name,
            type,
            status: 'Draft',
            thumbnail: `https://picsum.photos/seed/${Date.now()}/300/200`,
            url: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
            performance: { views: 0, uniqueVisitors: 0, conversionRate: 0, conversions: 0, bounceRate: 0, avgTimeOnPage: 0 },
            createdAt: new Date().toISOString(),
            createdBy: 'System User',
            updatedAt: new Date().toISOString(),
            updatedBy: 'System User',
        };
        setPages(prev => [newPage, ...prev]);
        setIsCreateModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('digital_marketing.website_pages.title')}
                    </h2>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg transition-colors shadow-sm"
                    >
                        <PlusCircleIcon /> {t('digital_marketing.website_pages.createPage')}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LandingPageKpiCard kpi={MOCK_LANDING_PAGE_KPIS.totalPages} />
                    <LandingPageKpiCard kpi={MOCK_LANDING_PAGE_KPIS.totalViews} />
                    <LandingPageKpiCard kpi={MOCK_LANDING_PAGE_KPIS.avgConversionRate} />
                    <LandingPageKpiCard kpi={MOCK_LANDING_PAGE_KPIS.totalConversions} />
                </div>
                
                 <LandingPagesTable
                    pages={filteredAndSortedPages}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

            </div>
            
            <CreatePageModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreatePage}
            />
        </>
    );
};

export default WebsitePagesTab;
