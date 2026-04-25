import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { Investment, AssetClass } from '../../../types';

interface AddInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (investment: Omit<Investment, 'id' | 'currentPrice'>) => void;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [assetClass, setAssetClass] = useState<AssetClass>('stocks');
    const [shariahCompliant, setShariahCompliant] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<'USD' | 'TRY' | 'SAR' | 'EUR'>('USD');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            ticker,
            assetClass,
            shariahCompliant,
            quantity,
            purchasePrice,
            purchaseDate,
            currency,
        });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('investments.holdings.addInvestment')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium">اسم الأصل</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">الرمز (اختياري)</label>
                                <input type="text" value={ticker} onChange={e => setTicker(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">فئة الأصل</label>
                                <select value={assetClass} onChange={e => setAssetClass(e.target.value as AssetClass)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    {Object.keys(t('investments.assetClasses', { returnObjects: true })).map(ac => (
                                        <option key={ac} value={ac}>{t(`investments.assetClasses.${ac}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">الكمية</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required min="0" step="any" className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">سعر الشراء</label>
                                <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} required min="0" step="any" className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">تاريخ الشراء</label>
                                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">العملة</label>
                                <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                    <option value="USD">USD</option>
                                    <option value="TRY">TRY</option>
                                    <option value="SAR">SAR</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={shariahCompliant} onChange={e => setShariahCompliant(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                                <span>{t('investments.holdings.shariahCompliant')}</span>
                            </label>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold">{t('investments.holdings.addInvestment')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInvestmentModal;
