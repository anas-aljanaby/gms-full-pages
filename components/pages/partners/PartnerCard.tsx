import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, Star, DollarSign } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber, formatCurrency } from '../../../lib/utils';
import type { Partner, PartnerStatus, PartnerSector } from '../../../types';

interface PartnerCardProps {
  partner: Partner;
  onClick: () => void;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onClick }) => {
    const { t, language } = useLocalization();
    
    const statusClasses: Record<PartnerStatus, { badge: string }> = {
        'نشط': { badge: 'bg-green-100 text-green-800' },
        'غير نشط': { badge: 'bg-gray-100 text-gray-800' },
        'قيد المراجعة': { badge: 'bg-yellow-100 text-yellow-800' },
    };

    const sectorClasses: Record<PartnerSector, string> = {
        'التعليم': 'bg-blue-100 text-blue-800',
        'الصحة': 'bg-red-100 text-red-800',
        'الإغاثة': 'bg-orange-100 text-orange-800',
        'التنمية': 'bg-purple-100 text-purple-800',
        'البيئة': 'bg-teal-100 text-teal-800',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all"
        >
            <div className="relative text-center">
                <div className={`absolute top-0 right-0 text-xs font-bold px-2 py-1 rounded-full ${statusClasses[partner.status].badge}`}>
                    {partner.status}
                </div>
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-2xl mx-auto mt-4">
                    {partner.logo}
                </div>
                <h3 className="font-bold text-lg mt-3">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.country}</p>
                 <div className="mt-2 flex justify-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sectorClasses[partner.sector]}`}>
                        {partner.sector}
                    </span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2 text-sm text-right">
                <InfoRow icon={<ClipboardList size={16} />} label={t('partners.card.projects')} value={`${partner.projectsCompleted} ${t('partners.card.completed')}`} />
                <InfoRow icon={<Clock size={16} />} label={t('partners.card.inProgress')} value={partner.projectsInProgress} />
                <InfoRow icon={<Star size={16} />} label={t('partners.card.rating')} value={`${partner.rating.toFixed(1)} / 5.0`} />
                <InfoRow icon={<DollarSign size={16} />} label={t('partners.card.budget')} value={formatCurrency(partner.budget, language)} />
            </div>

            <button onClick={onClick} className="mt-4 w-full py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                {t('partners.card.viewProfile')}
            </button>
        </motion.div>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex justify-between items-center text-gray-600">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
    </div>
);

export default PartnerCard;