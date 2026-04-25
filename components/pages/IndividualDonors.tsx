import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';
import { MOCK_INDIVIDUAL_DONORS } from '../../data/individualDonorsData';
import type { IndividualDonor, SortDirection } from '../../types';
import DonorsControls from './donors_individual/DonorsControls';
import DonorsTable from './donors_individual/DonorsTable';
import DonorDetailView from './donors_individual/DonorDetailView';
import AdvancedFilterPanel from './donors_individual/AdvancedFilterPanel';
import AddDonorModal from './donors_individual/AddDonorModal';
import DonorCard from './donors_individual/DonorCard';

const IndividualDonors: React.FC = () => {
    const { t, language } = useLocalization();
    const [donors, setDonors] = useState<IndividualDonor[]>(MOCK_INDIVIDUAL_DONORS);
    const [view, setView] = useState<'list' | 'card' | 'map'>('list');
    const [selectedDonor, setSelectedDonor] = useState<IndividualDonor | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // State for table interactions
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof IndividualDonor | null>('lastDonationDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const filteredAndSortedDonors = useMemo(() => {
        let filtered = donors.filter(donor => {
            const searchLower = searchTerm.toLowerCase();
            const donorName = donor.fullName[language] || donor.fullName.en;
            return donorName.toLowerCase().includes(searchLower) ||
                   donor.email.toLowerCase().includes(searchLower) ||
                   donor.country.toLowerCase().includes(searchLower);
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                     if (sortColumn === 'lastDonationDate' || sortColumn === 'donorSince') {
                         if (!aVal) return 1;
                         if (!bVal) return -1;
                        return sortDirection === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
                    }
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }

                if (sortColumn === 'fullName') {
                     const aName = a.fullName[language] || a.fullName.en;
                     const bName = b.fullName[language] || b.fullName.en;
                     return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }

                return 0;
            });
        }
        
        return filtered;
    }, [donors, searchTerm, sortColumn, sortDirection, language]);
    
    const handleSort = useCallback((column: keyof IndividualDonor) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    const handleAddDonor = (donorData: Omit<IndividualDonor, 'id' | 'totalDonations' | 'lastDonationDate' | 'status' | 'tier' | 'tags' | 'assignedManager' | 'avatar' | 'donorSince'>) => {
        const newDonor: IndividualDonor = {
            ...donorData,
            id: `DN-${String(donors.length + 1).padStart(3, '0')}`,
            totalDonations: 0,
            lastDonationDate: '',
            status: 'Active',
            tier: 'Bronze',
            tags: ['New'],
            assignedManager: 'Unassigned',
            avatar: `https://picsum.photos/seed/${donorData.email}/100/100`,
            donorSince: new Date().toISOString(),
        };
        setDonors(prev => [newDonor, ...prev]);
    };


    if (selectedDonor) {
        return <DonorDetailView donor={selectedDonor} onBack={() => setSelectedDonor(null)} />;
    }

    return (
        <>
            <AddDonorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddDonor}
            />
            <div className="flex flex-col h-full animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                        {t('individual_donors.title')}
                    </h1>
                </div>

                <DonorsControls
                    view={view}
                    onViewChange={setView}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onAddDonor={() => setIsAddModalOpen(true)}
                    onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
                />

                <AdvancedFilterPanel isOpen={filtersOpen} />

                <div className="flex-grow overflow-auto">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {view === 'list' ? (
                                <DonorsTable
                                    donors={filteredAndSortedDonors}
                                    onDonorSelect={setSelectedDonor}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                            ) : view === 'card' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredAndSortedDonors.map(donor => (
                                        <DonorCard key={donor.id} donor={donor} onClick={() => setSelectedDonor(donor)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-card dark:bg-dark-card rounded-xl">
                                    <p className="text-gray-500">{t(`individual_donors.${view}View`)} {t('placeholder.underConstruction')}</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default IndividualDonors;
