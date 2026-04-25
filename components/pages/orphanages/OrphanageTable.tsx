
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import type { Orphanage, OrphanageStatus } from '../../../types';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface OrphanageTableProps {
    orphanages: Orphanage[];
    t: (key: string) => string;
}

const OrphanageTable: React.FC<OrphanageTableProps> = ({ orphanages, t }) => {
    const { language } = useLocalization();
    const toast = useToast();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);


    const StatusBadge: React.FC<{ status: OrphanageStatus }> = ({ status }) => {
        const styles: Record<OrphanageStatus, string> = {
            'Active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(status.replace(' ', ''))}</span>;
    };
    
    const handleViewDetails = (orphanage: Orphanage) => {
        toast.showInfo(`Viewing details for ${orphanage.name[language]}...`);
        setActiveDropdown(null);
    };

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                        <tr>
                            <th className="p-4">{t('name')}</th>
                            <th className="p-4">{t('location')}</th>
                            <th className="p-4">{t('status')}</th>
                            <th className="p-4">{t('occupancy')}</th>
                            <th className="p-4">{t('budget')}</th>
                            <th className="p-4">{t('manager')}</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orphanages.map(o => {
                            const occupancy = o.capacity > 0 ? (o.beneficiaryCount / o.capacity) * 100 : 0;
                            return (
                                <tr key={o.id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-semibold text-foreground dark:text-dark-foreground">{o.name[language] || o.name.en}</td>
                                    <td className="p-4">{o.city}, {o.country}</td>
                                    <td className="p-4"><StatusBadge status={o.status} /></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: `${occupancy}%`}}></div></div>
                                            <span>{occupancy.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">{formatCurrency(o.budget, language)}</td>
                                    <td className="p-4">{o.manager}</td>
                                    <td className="p-4 text-end">
                                        <div className="relative inline-block" ref={activeDropdown === o.id ? dropdownRef : null}>
                                            <button onClick={() => setActiveDropdown(activeDropdown === o.id ? null : o.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                                                <MoreHorizontal />
                                            </button>
                                            {activeDropdown === o.id && (
                                                <div className="absolute end-0 mt-2 w-40 bg-card dark:bg-dark-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 text-start">
                                                    <div className="py-1">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleViewDetails(o); }} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">{t('view_details')}</a>
                                                        <a href="#" onClick={(e) => e.preventDefault()} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">Edit</a>
                                                        <a href="#" onClick={(e) => e.preventDefault()} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">Delete</a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrphanageTable;
