

import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { GrcRisk } from '../../../types';

interface LogRiskModalProps {
    onClose: () => void;
    // FIX: Replaced Object.values() with Object.keys() to ensure correct type inference and prevent errors when accessing answer properties.
    onLog: (risk: Omit<GrcRisk, 'id' | 'mitigation' | 'status'>) => void;
}

const LogRiskModal: React.FC<LogRiskModalProps> = ({ onClose, onLog }) => {
    const { t } = useLocalization();
    const [risk, setRisk] = useState('');
    const [category, setCategory] = useState('Operations');
    const [impact, setImpact] = useState(3);
    const [probability, setProbability] = useState(3);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const score = impact * probability;
        let level: GrcRisk['level'] = 'Low';
        if (score >= 20) level = 'Critical';
        else if (score >= 15) level = 'High';
        else if (score >= 8) level = 'Medium';

        onLog({
            risk,
            category,
            impact,
            probability,
            score,
            level,
            scope: 'Global', // Default value for new risks
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('grc.risk.logRisk')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Risk Description</label>
                            <textarea value={risk} onChange={e => setRisk(e.target.value)} rows={3} required className="w-full p-2 mt-1 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 mt-1 border rounded-md">
                                <option>Cyber/Technical</option>
                                <option>Financial</option>
                                <option>Compliance/Regulatory</option>
                                <option>Operations</option>
                                <option>Reputation</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Impact (1-5)</label>
                                <input type="number" min="1" max="5" value={impact} onChange={e => setImpact(Number(e.target.value))} className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Probability (1-5)</label>
                                <input type="number" min="1" max="5" value={probability} onChange={e => setProbability(Number(e.target.value))} className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Log Risk</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogRiskModal;