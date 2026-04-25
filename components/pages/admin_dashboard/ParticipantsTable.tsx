
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Participant, SortDirection } from '../../../types';
import { formatDate, formatNumber } from '../../../lib/utils';
import { ChevronDown, Search } from 'lucide-react';

const ParticipantsTable: React.FC<{ participants: Participant[] }> = ({ participants }) => {
    const { t, language } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortColumn, setSortColumn] = useState<keyof Participant | null>('registrationDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const filteredAndSortedData = useMemo(() => {
        let filtered = participants.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.attendanceStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                const direction = sortDirection === 'asc' ? 1 : -1;

                if (aVal === undefined || aVal === null) return 1 * direction;
                if (bVal === undefined || bVal === null) return -1 * direction;
                
                if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * direction;
                if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * direction;
                
                return 0;
            });
        }
        return filtered;
    }, [participants, searchTerm, statusFilter, sortColumn, sortDirection]);

    const paginatedData = filteredAndSortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

    const handleSort = (column: keyof Participant) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };
    
    const StatusBadge: React.FC<{status: Participant['attendanceStatus']}> = ({status}) => {
        const styles = {
            'Attended': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'Absent': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            'Registered': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`admin_dashboard.table.statuses.${status}`)}</span>;
    };
    
    const SortableHeader: React.FC<{ column: keyof Participant; label: string }> = ({ column, label }) => (
        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort(column)}>
            <div className="flex items-center gap-1">
                {label}
                {sortColumn === column && <ChevronDown className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
            </div>
        </th>
    );

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50">
            <div className="p-4 border-b dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between">
                <h3 className="text-lg font-bold">{t('admin_dashboard.table.title')}</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={t('admin_dashboard.table.search')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                    >
                        <option value="all">{t('admin_dashboard.table.all_statuses')}</option>
                        <option value="Attended">{t('admin_dashboard.table.statuses.Attended')}</option>
                        <option value="Absent">{t('admin_dashboard.table.statuses.Absent')}</option>
                        <option value="Registered">{t('admin_dashboard.table.statuses.Registered')}</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <SortableHeader column="name" label={t('admin_dashboard.table.name')} />
                            <SortableHeader column="registrationDate" label={t('admin_dashboard.table.reg_date')} />
                            <SortableHeader column="attendanceStatus" label={t('admin_dashboard.table.status')} />
                            <SortableHeader column="rating" label={t('admin_dashboard.table.rating')} />
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(p => (
                            <tr key={p.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-medium text-foreground dark:text-dark-foreground">{p.name}</td>
                                <td className="px-6 py-4">{formatDate(p.registrationDate, language)}</td>
                                <td className="px-6 py-4"><StatusBadge status={p.attendanceStatus} /></td>
                                <td className="px-6 py-4">{p.rating ? `${p.rating} ★` : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 flex justify-between items-center text-sm">
                <span>{t('common.showing')} {paginatedData.length} {t('common.of')} {filteredAndSortedData.length}</span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">{t('common.previous')}</button>
                    <span>{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">{t('common.next')}</button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsTable;
