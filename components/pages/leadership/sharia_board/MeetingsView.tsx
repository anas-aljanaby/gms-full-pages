

import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { MOCK_SHARIA_MEETINGS, MOCK_SHARIA_BOARD_MEMBERS } from '../../../../data/shariaBoardData';
import type { ShariaMeeting } from '../../../../types';
// FIX: Added missing 'Calendar' icon to the import from lucide-react.
import { ChevronLeft, ChevronRight, PlusCircle, XIcon, Clock, MapPin, Users, FileText, Download, Calendar } from 'lucide-react';
import AddMeetingModal from './AddMeetingModal';
import { formatDate } from '../../../../lib/utils';

const MeetingsView: React.FC = () => {
    const { t, language } = useLocalization();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState<ShariaMeeting[]>(MOCK_SHARIA_MEETINGS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<ShariaMeeting | null>(null);

    const handleAddMeeting = (meetingData: Omit<ShariaMeeting, 'id'>) => {
        const newMeeting: ShariaMeeting = {
            ...meetingData,
            id: `sm-${Date.now()}`
        };
        setMeetings(prev => [...prev, newMeeting]);
    };

    const meetingsByDate = useMemo(() => {
        const map = new Map<string, ShariaMeeting[]>();
        meetings.forEach(meeting => {
            const dateKey = new Date(meeting.date).toISOString().split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(meeting);
        });
        return map;
    }, [meetings]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const calendarDays = Array.from({ length: 42 }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        return day;
    });

    const dayNames = Array.from({ length: 7 }, (_, i) => 
        new Date(2023, 0, i + 1).toLocaleDateString(language, { weekday: 'short' })
    );

    return (
        <>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">
                            {currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronLeft/></button>
                            <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronRight/></button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg"
                    >
                        <PlusCircle size={18}/> {t('sharia.board.meetings.schedule')}
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 border dark:border-slate-700 rounded-lg overflow-hidden">
                    {dayNames.map(day => <div key={day} className="text-center py-2 bg-gray-50 dark:bg-slate-800 text-xs font-bold uppercase">{day}</div>)}
                    
                    {calendarDays.map(day => {
                        const dateKey = day.toISOString().split('T')[0];
                        const dayMeetings = meetingsByDate.get(dateKey) || [];
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div key={dateKey} className={`p-2 h-32 bg-card dark:bg-dark-card overflow-y-auto ${!isCurrentMonth ? 'bg-gray-50 dark:bg-slate-800/50' : ''}`}>
                                 <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-sharia-secondary text-white' : ''}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 space-y-1">
                                    {dayMeetings.map(meeting => (
                                        <button key={meeting.id} onClick={() => setSelectedMeeting(meeting)} className="w-full text-left p-1 bg-sharia-primary/20 rounded-md text-xs truncate" title={meeting.title[language]}>
                                            {meeting.title[language]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AddMeetingModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddMeeting={handleAddMeeting}
            />

            {selectedMeeting && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedMeeting(null)}>
                    <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4 p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-xl font-bold">{selectedMeeting.title[language]}</h2>
                            <button onClick={() => setSelectedMeeting(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                        </div>

                        <div className="overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2"><Clock size={16} /> <strong>{t('leadership.eventTime')}:</strong> {selectedMeeting.startTime} - {selectedMeeting.endTime}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} /> <strong>{t('common.date')}:</strong> {formatDate(selectedMeeting.date, language)}</div>
                                <div className="flex items-center gap-2"><MapPin size={16} /> <strong>{t('leadership.eventLocation')}:</strong> {selectedMeeting.location}</div>
                            </div>
                            
                            <div>
                                <h3 className="font-bold mb-2 flex items-center gap-2"><Users size={18} /> {t('sharia.board.members.title')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMeeting.attendees?.map(id => {
                                        const member = MOCK_SHARIA_BOARD_MEMBERS.find(m => m.id === id);
                                        return member ? <span key={id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">{member.name[language]}</span> : null;
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-2 flex items-center gap-2"><FileText size={18} /> {t('sharia.meetings.agenda')}</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    {selectedMeeting.agenda?.map((item, i) => (
                                        <li key={i}><strong>{item.topic[language]}</strong> ({t('sharia.meetings.presenter')}: {item.presenter})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-end flex-shrink-0">
                             <a href={selectedMeeting.minutesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg">
                                <Download size={16} /> {t('sharia.meetings.downloadMinutes')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MeetingsView;
