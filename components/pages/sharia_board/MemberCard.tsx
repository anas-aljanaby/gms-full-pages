import React from 'react';
import type { ShariaBoardMember, ShariaBoardRole, ShariaMemberStatus } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { Mail, Check, Briefcase } from 'lucide-react';

const MemberCard: React.FC<{ member: ShariaBoardMember }> = ({ member }) => {
    const { t, language } = useLocalization();

    const statusConfig: Record<ShariaMemberStatus, { color: string; icon: React.ReactNode }> = {
        'Active': { color: 'bg-green-500', icon: <Check size={10} className="text-white"/> },
        'On Leave': { color: 'bg-yellow-500', icon: null },
        'Inactive': { color: 'bg-gray-400', icon: null },
    };
    const currentStatus = statusConfig[member.status];

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border border-gray-200 dark:border-slate-700 overflow-hidden text-center transition-transform hover:-translate-y-1">
            <div className="bg-sharia-primary/10 h-20" />
            <div className="relative px-4 pb-4 -mt-12">
                <img src={member.photoUrl} alt={member.name.en} className="w-24 h-24 rounded-full mx-auto border-4 border-card dark:border-dark-card shadow-lg" />
                <div className="absolute top-14 right-1/2 translate-x-1/2 translate-y-1/2">
                    <span title={t(`sharia.board.statuses.${member.status.replace(' ', '')}`)} className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-card dark:border-dark-card ${currentStatus.color}`}>
                        {currentStatus.icon}
                    </span>
                </div>
                <h3 className="mt-4 font-bold text-lg">{member.name[language]}</h3>
                <p className="text-xs text-gray-500">{member.title[language]}</p>
                <div className="mt-2 text-sm font-semibold px-3 py-1 bg-sharia-secondary/20 text-sharia-secondary-dark dark:text-sharia-secondary rounded-full inline-block">
                    {t(`sharia.board.roles.${member.role}`)}
                </div>
                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-center items-center gap-4 text-gray-500">
                    <a href={`mailto:${member.email}`} className="hover:text-primary"><Mail size={18}/></a>
                    <button className="hover:text-primary"><Check size={18}/></button>
                    <button className="hover:text-primary"><Briefcase size={18}/></button>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;