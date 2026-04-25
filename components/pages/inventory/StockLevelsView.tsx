import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_INVENTORY_DATA } from '../../../data/inventoryData';
import { formatNumber } from '../../../lib/utils';
import { AlertTriangle } from 'lucide-react';

const StockLevelsView: React.FC = () => {
    const { t, language } = useLocalization();
    const { items, warehouses, stockLevels } = MOCK_INVENTORY_DATA;

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                        <tr>
                            <th className="p-4">{t('inventory.stock.item')}</th>
                            {warehouses.map(wh => (
                                <th key={wh.id} className="p-4 text-center">{wh.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const totalStock = stockLevels
                                .filter(sl => sl.itemId === item.id)
                                .reduce((sum, sl) => sum + sl.quantity, 0);

                            return (
                                <tr key={item.id} className="border-t dark:border-slate-700">
                                    <td className="p-4 font-bold text-foreground dark:text-dark-foreground">
                                        {item.name[language]}
                                        <p className="text-xs font-normal text-gray-400">{t('inventory.stock.total')}: {totalStock}</p>
                                    </td>
                                    {warehouses.map(wh => {
                                        const stock = stockLevels.find(sl => sl.itemId === item.id && sl.warehouseId === wh.id);
                                        const isLowStock = stock ? stock.quantity < stock.lowStockThreshold : false;
                                        return (
                                            <td key={wh.id} className="p-4 text-center">
                                                {stock ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className={`font-semibold ${isLowStock ? 'text-red-500' : ''}`}>
                                                            {formatNumber(stock.quantity, language)}
                                                        </span>
                                                        {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" title={t('inventory.dashboard.lowStock')} />}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockLevelsView;