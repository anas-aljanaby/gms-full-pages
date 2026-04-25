

import React from 'react';
import type { GrcRisk, GrcRiskLevel } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';

interface RiskDetailModalProps {
    risk: GrcRisk | null;
    onClose: () => void;
}

const getLevelStyles = (level: GrcRiskLevel): { text: string, bg: string } => {
    switch (level) {
        case 'Critical': return { text: 'text-red-800', bg: 'bg-red-100' };
        case 'High': return { text: 'text-orange-800', bg: 'bg-orange-100' };
        case 'Medium': return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
        case 'Low': return { text: 'text-blue-800', bg: 'bg-blue-100' };
        default: return { text: 'text-gray-800', bg: 'bg-gray-100' };
    }
};

const InfoItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-md font-bold">{value}</p>
    </div>
);

const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ risk, onClose }) => {
    const { t } = useLocalization();
    // FIX: The `risk` prop can be null, causing potential errors when accessing its properties. Added a null check to ensure the component only renders when a valid risk object is provided.
    if (!risk) return null;

    const { text, bg } = getLevelStyles(risk.level);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{risk.risk}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className={`p-3 rounded-lg ${bg}`}>
                            <p className="text-xs font-bold">{t('grc.risk.level')}</p>
                            <p className={`text-lg font-extrabold ${text}`}>{risk.level}</p>
                        </div>
                        <InfoItem label={t('grc.risk.table.score')} value={risk.score} />
                        <InfoItem label={t('projects.risks.impact')} value={risk.impact} />
                        <InfoItem label={t('projects.risks.probability')} value={risk.probability} />
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label={t('projects.risks.category')} value={risk.category} />
                        <InfoItem label={t('grc.risk.scope')} value={risk.scope} />
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">{t('grc.risk.mitigation.title')}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm bg-gray-50 dark:bg-slate-800/50 p-4 rounded-md">
                            {risk.mitigation.map((measure, index) => (
                                <li key={index}>{measure}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                 <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.close')}</button>
                    <button type="button" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">{t('grc.risk.mitigation.update')}</button>
                </div>
            </div>
        </div>
    );
};

export default RiskDetailModal;