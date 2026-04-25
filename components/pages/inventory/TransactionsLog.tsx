import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_INVENTORY_DATA } from '../../../data/inventoryData';
import type { Project } from '../../../types';
import { formatDate, formatNumber } from '../../../lib/utils';
import { ArrowDown, ArrowUp, Edit } from 'lucide-react';

interface TransactionsLogProps {
    projects: Project[];
}

const TransactionsLog: React.FC<TransactionsLogProps> = ({ projects }) => {
    const { t, language } = useLocalization();
    const { items, warehouses, transactions } = MOCK_INVENTORY_DATA;

    const transactionDetails = transactions.map(tx => {
        const item = items.find(i => i.id === tx.itemId);
        const warehouse = warehouses.find(w => w.id === tx.warehouseId);
        const project = projects.find(p => p.id === tx.relatedProjectId);
        return { ...tx, itemName: item?.name[language], warehouseName: warehouse?.name, projectName: project?.name[language] };
    });

    const TypeBadge: React.FC<{ type: 'inbound' | 'outbound' | 'adjustment' }> = ({ type }) => {
        const config = {
            inbound: { icon: <ArrowUp className="w-3 h-3"/>, color: 'bg-green-100 text-green-800' },
            outbound: { icon: <ArrowDown className="w-3 h-3"/>, color: 'bg-red-100 text-red-800' },
            adjustment: { icon: <Edit className="w-3 h-3"/>, color: 'bg-yellow-100 text-yellow-800' },
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${config[type].color}`}>
                {config[type].icon}
                {t(`inventory.transactions.types.${type}`)}
            </span>
        )
    };

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                         <tr>
                            <th className="p-4">{t('inventory.transactions.date')}</th>
                            <th className="p-4">{t('inventory.items.item')}</th>
                            <th className="p-4">{t('inventory.transactions.type')}</th>
                            <th className="p-4 text-end">{t('inventory.transactions.quantity')}</th>
                            <th className="p-4">{t('inventory.transactions.warehouse')}</th>
                            <th className="p-4">{t('inventory.transactions.notes')}</th>
                        </tr>
                    </thead>
                     <tbody>
                        {transactionDetails.map(tx => (
                            <tr key={tx.id} className="border-t dark:border-slate-700">
                                <td className="p-4">{formatDate(tx.date, language)}</td>
                                <td className="p-4 font-semibold">{tx.itemName}</td>
                                <td className="p-4"><TypeBadge type={tx.type} /></td>
                                <td className={`p-4 text-end font-bold ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.quantity > 0 ? '+' : ''}{formatNumber(tx.quantity, language)}
                                </td>
                                <td className="p-4">{tx.warehouseName}</td>
                                <td className="p-4 text-xs text-gray-500">
                                    {tx.notes}
                                    {tx.projectName && <p className="font-semibold">{t('inventory.transactions.project')}: {tx.projectName}</p>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsLog;