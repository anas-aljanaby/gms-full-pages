import React, { useState } from 'react';
import { XIcon } from '../../icons/GenericIcons';
import type { Orphanage, OrphanageStatus, Language } from '../../../types';

interface AddOrphanageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: Omit<Orphanage, 'id' | 'logo'>) => void;
    t: (key: string) => string;
}

const AddOrphanageModal: React.FC<AddOrphanageModalProps> = ({ isOpen, onClose, onAdd, t }) => {
    const [name, setName] = useState({ en: '', ar: '', tr: '' });
    const [country, setCountry] = useState('Turkey');
    const [city, setCity] = useState('');
    const [status, setStatus] = useState<OrphanageStatus>('Active');
    const [capacity, setCapacity] = useState(0);
    const [beneficiaryCount, setBeneficiaryCount] = useState(0);
    const [budget, setBudget] = useState(0);
    const [manager, setManager] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name: {
                en: name.en || name.ar,
                ar: name.ar || name.en,
                tr: name.tr || name.en
            },
            country,
            city,
            status,
            capacity,
            beneficiaryCount,
            budget,
            manager
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('add')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium">Name (EN)</label>
                            <input type="text" value={name.en} onChange={e => setName(n => ({...n, en: e.target.value}))} required className="w-full p-2 mt-1 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Name (AR)</label>
                            <input type="text" value={name.ar} onChange={e => setName(n => ({...n, ar: e.target.value}))} dir="rtl" className="w-full p-2 mt-1 border rounded-md"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Country</label><input type="text" value={country} onChange={e => setCountry(e.target.value)} required className="w-full p-2 mt-1 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium">City</label><input type="text" value={city} onChange={e => setCity(e.target.value)} required className="w-full p-2 mt-1 border rounded-md"/></div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Capacity</label><input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} required className="w-full p-2 mt-1 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium">Beneficiaries</label><input type="number" value={beneficiaryCount} onChange={e => setBeneficiaryCount(Number(e.target.value))} required className="w-full p-2 mt-1 border rounded-md"/></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Annual Budget</label><input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} required className="w-full p-2 mt-1 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium">Status</label><select value={status} onChange={e => setStatus(e.target.value as OrphanageStatus)} className="w-full p-2 mt-1 border rounded-md"><option>Active</option><option>Under Review</option><option>Inactive</option></select></div>
                        </div>
                        <div><label className="block text-sm font-medium">Manager</label><input type="text" value={manager} onChange={e => setManager(e.target.value)} required className="w-full p-2 mt-1 border rounded-md"/></div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">{t('add')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOrphanageModal;
