import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { MOCK_SHARIA_BOARD_MEMBERS } from '../../../data/shariaBoardData';
import type { ShariaBoardMember, ShariaBoardRole, ShariaMemberStatus } from '../../../types';
import { Search, PlusCircle, LayoutGrid, List } from 'lucide-react';
import MemberCard from './MemberCard';
import MembersTable from './MembersTable';
import AddMemberModal from './AddMemberModal';

const BoardMembersView: React.FC = () => {
    const { t } = useLocalization();
    const [members, setMembers] = useState<ShariaBoardMember[]>(MOCK_SHARIA_BOARD_MEMBERS);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<ShariaBoardRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ShariaMemberStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.name.en.toLowerCase().includes(searchTerm.toLowerCase()) || member.name.ar.includes(searchTerm);
            const matchesRole = roleFilter === 'all' || member.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [members, searchTerm, roleFilter, statusFilter]);
    
    const handleAddMember = (newMember: Omit<ShariaBoardMember, 'id' | 'credentials' | 'bio'>) => {
        const fullNewMember: ShariaBoardMember = {
            ...newMember,
            id: `sbm-${Date.now()}`,
            credentials: [],
            bio: { en: '', ar: '', tr: '' },
        };
        setMembers(prev => [fullNewMember, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative lg:col-span-2">
                             <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder={t('sharia.board.members.searchPlaceholder')}
                                className="w-full p-2 pl-10 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                            />
                        </div>
                         <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                            <option value="all">{t('sharia.board.members.allRoles')}</option>
                            {(['Chairman', 'Member', 'Secretary', 'Observer'] as ShariaBoardRole[]).map(r => <option key={r} value={r}>{t(`sharia.board.roles.${r}`)}</option>)}
                        </select>
                         <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                            <option value="all">{t('sharia.board.members.allStatuses')}</option>
                            {(['Active', 'On Leave', 'Inactive'] as ShariaMemberStatus[]).map(s => <option key={s} value={s}>{t(`sharia.board.statuses.${s.replace(' ', '')}`)}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="p-1 bg-gray-200 dark:bg-slate-700 rounded-lg flex">
                        <button onClick={() => setView('grid')} className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><LayoutGrid/></button>
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}><List/></button>
                    </div>
                     <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg">
                        <PlusCircle /> {t('sharia.board.members.add')}
                    </button>
                </div>
                
                {view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredMembers.map(member => <MemberCard key={member.id} member={member} />)}
                    </div>
                ) : (
                    <MembersTable members={filteredMembers} />
                )}
            </div>
            
            <AddMemberModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMember}
            />
        </>
    );
};

export default BoardMembersView;