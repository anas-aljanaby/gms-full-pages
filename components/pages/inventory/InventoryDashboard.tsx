
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { MOCK_INVENTORY_DATA } from '../../../data/inventoryData';
import { Package, Warehouse, AlertTriangle, DollarSign as DollarSignIcon } from 'lucide-react';

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
        <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
        </div>
    </div>
);

const InventoryDashboard: React.FC = () => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { items, stockLevels, warehouses } = MOCK_INVENTORY_DATA;

    const stats = useMemo(() => {
        const lowStockItems = stockLevels.filter(sl => sl.quantity < sl.lowStockThreshold).length;
        const totalValue = stockLevels.reduce((sum, sl) => {
            const item = items.find(i => i.id === sl.itemId);
            return sum + (sl.quantity * (item?.valuePerUnit || 0));
        }, 0);
        return {
            totalItems: items.length,
            lowStockItems,
            totalValue,
            warehouseCount: warehouses.length
        };
    }, [items, stockLevels, warehouses]);

    const itemsByCategory = useMemo(() => {
        const categoryCounts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(categoryCounts).map(([name, value]) => ({ name: t(`inventory.categories.${name}`), value }));
    }, [items, t]);

    const stockByWarehouse = useMemo(() => {
        const warehouseStock = warehouses.map(wh => {
            const totalQuantity = stockLevels.filter(sl => sl.warehouseId === wh.id).reduce((sum, sl) => sum + sl.quantity, 0);
            return { name: wh.name, quantity: totalQuantity };
        });
        return warehouseStock;
    }, [warehouses, stockLevels]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('inventory.dashboard.totalItems')} value={formatNumber(stats.totalItems, language)} icon={<Package />} colorClass="bg-blue-100 text-blue-600" />
                <KpiCard title={t('inventory.dashboard.lowStock')} value={formatNumber(stats.lowStockItems, language)} icon={<AlertTriangle />} colorClass="bg-red-100 text-red-600" />
                <KpiCard title={t('inventory.dashboard.totalValue')} value={formatCurrency(stats.totalValue, language)} icon={<DollarSignIcon />} colorClass="bg-green-100 text-green-600" />
                <KpiCard title={t('inventory.dashboard.warehouses')} value={formatNumber(stats.warehouseCount, language)} icon={<Warehouse />} colorClass="bg-purple-100 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                    <h3 className="font-semibold mb-4 text-center">{t('inventory.dashboard.itemsByCategory')}</h3>
                    <div className="h-80">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={itemsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {itemsByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: unknown) => {
                                    const numericValue = Number(value);
                                    if (isNaN(numericValue)) {
                                        return `${String(value)} items`;
                                    }
                                    return `${formatNumber(numericValue, language)} items`;
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="lg:col-span-3 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                    <h3 className="font-semibold mb-4">{t('inventory.dashboard.stockByWarehouse')}</h3>
                     <div className="h-80">
                        <ResponsiveContainer>
                            <BarChart data={stockByWarehouse} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                                <XAxis type="number" tick={{ fill: isDark ? "#fff" : "#333" }} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fill: isDark ? "#fff" : "#333", fontSize: 12 }}/>
                                <Tooltip formatter={(value: unknown) => {
                                    const numericValue = Number(value);
                                    if (isNaN(numericValue)) {
                                        return `${String(value)} units`;
                                    }
                                    return `${formatNumber(numericValue, language)} units`;
                                }} />
                                <Bar dataKey="quantity" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;