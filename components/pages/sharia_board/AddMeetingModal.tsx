import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { XIcon } from '../../icons/GenericIcons';
import type { ShariaMeeting } from '../../../types';

interface AddMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMeeting: (meetingData: Omit<ShariaMeeting, 'id'>) => void;
}

const AddMeetingModal: React.FC<AddMeetingModalProps> = ({ isOpen, onClose, onAddMeeting }) => {
    const { t } = useLocalization();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');
    const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !startTime || !endTime) {
            alert('Please fill all required fields.');
            return;
        }
        onAddMeeting({
            title: { en: title, ar: title, tr: title }, // Simple for now
            date,
            startTime,
            endTime,
            location,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('sharia.board.meetings.schedule')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">عنوان الاجتماع</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">التاريخ</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">المكان</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="مثال: قاعة الاجتماعات 1" required className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">وقت البدء</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">وقت الانتهاء</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold">{t('sharia.board.meetings.schedule')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMeetingModal;
