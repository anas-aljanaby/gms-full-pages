import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_INVENTORY_DATA } from '../../../data/inventoryData';
import type { InventoryItem } from '../../../types';
import { SearchIcon, PlusCircleIcon } from '../../icons/GenericIcons';

const ItemsList: React.FC = () => {
    const { t, language } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const { items, stockLevels } = MOCK_INVENTORY_DATA;

    const itemsWithStock = useMemo(() => {
        return items.map(item => {
            const totalStock = stockLevels
                .filter(sl => sl.itemId === item.id)
                .reduce((sum, sl) => sum + sl.quantity, 0);
            return { ...item, totalStock };
        }).filter(item => 
            item.name[language].toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, stockLevels, searchTerm, language]);

    return (
        <div className="space-y-4">
            <div className="p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={t('inventory.items.search')}
                            className="block w-full p-2.5 pl-10 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg flex items-center justify-center gap-2">
                        <PlusCircleIcon /> {t('inventory.items.addItem')}
                    </button>
                </div>
            </div>

            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                             <tr>
                                <th className="p-4">{t('inventory.items.item')}</th>
                                <th className="p-4">{t('inventory.items.category')}</th>
                                <th className="p-4">{t('inventory.items.sku')}</th>
                                <th className="p-4 text-end">{t('inventory.items.totalStock')}</th>
                                <th className="p-4">{t('inventory.items.unit')}</th>
                            </tr>
                        </thead>
                         <tbody>
                            {itemsWithStock.map(item => (
                                <tr key={item.id} className="border-t dark:border-slate-700">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={item.imageUrl} alt={item.name.en} className="w-10 h-10 rounded-md object-cover" loading="lazy"/>
                                            <span className="font-bold text-foreground dark:text-dark-foreground">{item.name[language]}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{t(`inventory.categories.${item.category}`)}</td>
                                    <td className="p-4 font-mono text-xs">{item.sku}</td>
                                    <td className="p-4 text-end font-bold text-lg">{item.totalStock}</td>
                                    <td className="p-4">{item.unitOfMeasure}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ItemsList;