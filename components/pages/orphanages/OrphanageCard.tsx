
import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber } from '../../../lib/utils';
import type { Orphanage, OrphanageStatus } from '../../../types';
import { Users, User } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';


interface OrphanageCardProps {
    orphanage: Orphanage;
    t: (key: string) => string;
}

const OrphanageCard: React.FC<OrphanageCardProps> = ({ orphanage, t }) => {
    const { language } = useLocalization();
    const toast = useToast();
    const occupancy = orphanage.capacity > 0 ? (orphanage.beneficiaryCount / orphanage.capacity) * 100 : 0;
    
    const statusClasses: Record<OrphanageStatus, string> = {
        'Active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast.showInfo(`Viewing details for ${orphanage.name[language]}...`);
    };

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-5 flex flex-col border dark:border-slate-700/50">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary text-2xl flex items-center justify-center rounded-lg">{orphanage.logo}</div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground dark:text-dark-foreground">{orphanage.name[language] || orphanage.name.en}</h3>
                        <p className="text-sm text-gray-500">{orphanage.city}, {orphanage.country}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClasses[orphanage.status]}`}>
                    {t(orphanage.status.replace(' ', ''))}
                </span>
            </div>
            
            <div className="mt-4 flex-grow space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-gray-400"/>
                    <span>{t('beneficiaries')}:</span>
                    <span className="font-bold">{formatNumber(orphanage.beneficiaryCount, language)}</span>
                    <span className="text-gray-400">/ {formatNumber(orphanage.capacity, language)}</span>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                        <span>{t('occupancy')}</span>
                        <span>{occupancy.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${occupancy}%` }}></div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-400"/>
                    <span>{t('manager')}:</span>
                    <span className="font-semibold">{orphanage.manager}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <button onClick={handleViewDetails} className="w-full py-2 text-sm font-semibold text-primary dark:text-secondary-light bg-primary-light dark:bg-secondary/20 rounded-lg hover:bg-primary/20 dark:hover:bg-secondary/30 transition-colors">
                    {t('view_details')}
                </button>
            </div>
        </div>
    );
};

export default OrphanageCard;
