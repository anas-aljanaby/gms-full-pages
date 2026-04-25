import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { ShariaBoardRole, ShariaMemberStatus, Language } from '../../../types';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (memberData: any) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<ShariaBoardRole>('Member');
    const [status, setStatus] = useState<ShariaMemberStatus>('Active');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name: { en: name, ar: name, tr: name },
            title: { en: title, ar: title, tr: title },
            email,
            role,
            status,
            photoUrl: `https://picsum.photos/seed/${name.replace(' ', '')}/200/200`,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('sharia.board.members.add')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('sharia.board.form.name')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('sharia.board.form.title')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('sharia.board.form.email')}</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('sharia.board.form.role')}</label>
                                <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-2 mt-1 border rounded-md">
                                    {(['Chairman', 'Member', 'Secretary', 'Observer'] as ShariaBoardRole[]).map(r => <option key={r} value={r}>{t(`sharia.board.roles.${r}`)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('sharia.board.form.status')}</label>
                                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 mt-1 border rounded-md">
                                    {(['Active', 'On Leave', 'Inactive'] as ShariaMemberStatus[]).map(s => <option key={s} value={s}>{t(`sharia.board.statuses.${s.replace(' ', '')}`)}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold">{t('sharia.board.members.add')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;