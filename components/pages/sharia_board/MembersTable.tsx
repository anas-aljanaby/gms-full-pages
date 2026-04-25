import React from 'react';
import type { ShariaBoardMember, ShariaMemberStatus, ShariaBoardRole } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { MoreHorizontal } from 'lucide-react';

const MembersTable: React.FC<{ members: ShariaBoardMember[] }> = ({ members }) => {
    const { t, language } = useLocalization();

    const StatusBadge: React.FC<{status: ShariaMemberStatus}> = ({ status }) => {
        const styles = {
            'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'On Leave': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{t(`sharia.board.statuses.${status.replace(' ','')}`)}</span>;
    };

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-card/50 dark:text-gray-400">
                        <tr>
                            <th className="p-4">{t('sharia.board.table.member')}</th>
                            <th className="p-4">{t('sharia.board.table.role')}</th>
                            <th className="p-4">{t('sharia.board.table.status')}</th>
                            <th className="p-4">{t('sharia.board.table.credentials')}</th>
                            <th className="p-4 text-right">{t('sharia.board.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id} className="border-t dark:border-slate-700">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={member.photoUrl} alt={member.name.en} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-bold text-foreground dark:text-dark-foreground">{member.name[language]}</p>
                                            <p className="text-xs text-gray-500">{member.title[language]}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">{t(`sharia.board.roles.${member.role}`)}</td>
                                <td className="p-4"><StatusBadge status={member.status} /></td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {member.credentials.map(cred => <span key={cred} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-slate-700 rounded-full">{cred}</span>)}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><MoreHorizontal /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersTable;