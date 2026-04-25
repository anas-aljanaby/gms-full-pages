

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import DisclosureCard from './DisclosureCard';
import type { GriStandard } from '../../../data/griData';

interface DisclosureListProps {
    groupedStandards: Record<string, GriStandard[]>;
}

// FIX: Replaced local `isExpanded` state management with a centralized `DisclosureListWrapper` component to ensure that only one disclosure card is open at a time.
const DisclosureList: React.FC<DisclosureListProps> = ({ groupedStandards }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(Object.keys(groupedStandards)[0] || null);

    return (
        <div className="space-y-1">
            {Object.keys(groupedStandards).map(groupName => {
                const standards = groupedStandards[groupName];
                const isOpen = openAccordion === groupName;
                return (
                    <div key={groupName} className="bg-card dark:bg-dark-card rounded-lg shadow-sm overflow-hidden border dark:border-slate-700">
                        <button
                            onClick={() => setOpenAccordion(isOpen ? null : groupName)}
                            className="w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-dark-card/50 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                            aria-expanded={isOpen}
                        >
                            <h3 className="font-bold text-lg">{groupName}</h3>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                <ChevronDown />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-2 space-y-px">
                                        {standards.map(standard => (
                                            <DisclosureCard 
                                                key={standard.disclosureNumber} 
                                                standard={standard}
                                                isExpanded={openAccordion === groupName} // This is incorrect, but let's fix it properly. Each card needs its own state. A better approach is to manage expansion in this parent.
                                                onToggle={() => {}} // We'll manage this here.
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};


const DisclosureListWrapper: React.FC<DisclosureListProps> = ({ groupedStandards }) => {
    const [expandedDisclosure, setExpandedDisclosure] = useState<string | null>(null);

    const handleToggle = (disclosureNumber: string) => {
        setExpandedDisclosure(prev => (prev === disclosureNumber ? null : disclosureNumber));
    };

    return (
        <div className="space-y-1">
            {Object.keys(groupedStandards).map(groupName => {
                const standards = groupedStandards[groupName];
                return (
                    <div key={groupName} className="bg-card dark:bg-dark-card rounded-lg shadow-sm overflow-hidden border dark:border-slate-700">
                        <div className="w-full p-4 text-left bg-gray-50 dark:bg-dark-card/50">
                            <h3 className="font-bold text-lg">{groupName}</h3>
                        </div>
                        <div className="p-2 space-y-px">
                            {standards.map(standard => (
                                <DisclosureCard 
                                    key={standard.disclosureNumber} 
                                    standard={standard}
                                    isExpanded={expandedDisclosure === standard.disclosureNumber}
                                    onToggle={() => handleToggle(standard.disclosureNumber)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DisclosureListWrapper;