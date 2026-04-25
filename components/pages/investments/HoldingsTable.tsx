import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import type { Investment, AssetClass, Portfolio } from '../../../types';
import { SearchIcon, PlusCircleIcon } from '../../icons/GenericIcons';
import AddInvestmentModal from './AddInvestmentModal';

interface HoldingsTableProps {
    portfolio: Portfolio;
    onAddInvestment: (investment: Omit<Investment, 'id' | 'currentPrice'>) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ portfolio, onAddInvestment }) => {
    const { t, language } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<{ assetClass: AssetClass | 'all'; shariah: 'all' | 'compliant' }>({
        assetClass: 'all',
        shariah: 'all'
    });
    
    const filteredHoldings = useMemo(() => {
        return portfolio.investments.filter(inv => {
            const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) || (inv.ticker && inv.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesAssetClass = filter.assetClass === 'all' || inv.assetClass === filter.assetClass;
            const matchesShariah = filter.shariah === 'all' || (filter.shariah === 'compliant' && inv.shariahCompliant);
            return matchesSearch && matchesAssetClass && matchesShariah;
        });
    }, [searchTerm, filter, portfolio.investments]);
    
    return (
        <>
            <AddInvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAddInvestment} />
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('investments.holdings.search')}
                                className="block w-full p-2.5 pl-10 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <select onChange={e => setFilter(f => ({...f, assetClass: e.target.value as any}))} className="p-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                            <option value="all">{t('investments.holdings.allAssetClasses')}</option>
                            {Object.keys(t('investments.assetClasses', { returnObjects: true })).map(ac => (
                                <option key={ac} value={ac}>{t(`investments.assetClasses.${ac}`)}</option>
                            ))}
                        </select>
                         <select onChange={e => setFilter(f => ({...f, shariah: e.target.value as any}))} className="p-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                            <option value="all">{t('investments.holdings.allCompliance')}</option>
                            <option value="compliant">{t('investments.holdings.shariah')}</option>
                        </select>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg flex items-center justify-center gap-2">
                            <PlusCircleIcon /> {t('investments.holdings.addInvestment')}
                        </button>
                    </div>
                </div>

                <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                                 <tr>
                                    <th className="p-4">{t('investments.holdings.asset')}</th>
                                    <th className="p-4">{t('investments.holdings.assetClass')}</th>
                                    <th className="p-4 text-end">{t('investments.holdings.quantity')}</th>
                                    <th className="p-4 text-end">{t('investments.holdings.marketValue')}</th>
                                    <th className="p-4 text-end">{t('investments.holdings.gainLoss')}</th>
                                    <th className="p-4 text-end">{t('investments.holdings.roi')}</th>
                                    <th className="p-4 text-center">{t('investments.holdings.shariah')}</th>
                                </tr>
                            </thead>
                             <tbody>
                                {filteredHoldings.map(inv => {
                                    const marketValue = inv.quantity * inv.currentPrice;
                                    const costBasis = inv.quantity * inv.purchasePrice;
                                    const gainLoss = marketValue - costBasis;
                                    const roi = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                                    return (
                                        <tr key={inv.id} className="border-t dark:border-slate-700">
                                            <td className="p-4 font-bold text-foreground dark:text-dark-foreground">
                                                {inv.name}
                                                {inv.ticker && <span className="ms-2 text-xs font-normal text-gray-400">{inv.ticker}</span>}
                                            </td>
                                            <td className="p-4">{t(`investments.assetClasses.${inv.assetClass}`)}</td>
                                            <td className="p-4 text-end">{formatNumber(inv.quantity, language)}</td>
                                            <td className="p-4 text-end font-semibold">{formatCurrency(marketValue, language)}</td>
                                            <td className={`p-4 text-end font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(gainLoss, language)}
                                            </td>
                                            <td className={`p-4 text-end font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {roi.toFixed(2)}%
                                            </td>
                                            <td className="p-4 text-center">
                                                {inv.shariahCompliant && <span className="text-green-500 text-lg">✓</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HoldingsTable;