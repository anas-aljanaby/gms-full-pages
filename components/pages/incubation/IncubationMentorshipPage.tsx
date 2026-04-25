import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import type { IncubationData, MentorshipSession, Startup, Mentor } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { PlusCircle, Edit, Trash2, Star, X } from 'lucide-react';

interface IncubationMentorshipPageProps {
  incubationData: IncubationData;
}

// Star Rating Component for display and input
const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
        ))}
    </div>
);

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        className="focus:outline-none p-1"
                    >
                        <Star
                            size={24}
                            className={`transition-colors ${
                                hoverRating >= starValue || rating >= starValue
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};


// Session Modal for Add/Edit
const SessionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Omit<MentorshipSession, 'id'> | MentorshipSession) => void;
    session?: MentorshipSession | null;
    startups: Startup[];
    mentors: Mentor[];
}> = ({ isOpen, onClose, onSave, session, startups, mentors }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Omit<MentorshipSession, 'id'>>({
        startupId: session?.startupId || '',
        mentorId: session?.mentorId || '',
        date: session ? new Date(session.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        topic: session?.topic || '',
        notes: session?.notes || '',
        rating: session?.rating || 0,
    });
    
    // Reset form when session prop changes (for opening edit modal)
    React.useEffect(() => {
        setFormData({
            startupId: session?.startupId || '',
            mentorId: session?.mentorId || '',
            date: session ? new Date(session.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            topic: session?.topic || '',
            notes: session?.notes || '',
            rating: session?.rating || 0,
        });
    }, [session]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(session ? { ...formData, id: session.id } : formData);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{session ? 'Edit Session' : 'Add New Session'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Startup/Founder</label>
                                <select value={formData.startupId} onChange={e => setFormData({...formData, startupId: e.target.value})} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                                    <option value="" disabled>Select Startup</option>
                                    {startups.map(s => <option key={s.id} value={s.id}>{s.name} ({s.founder.name})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Mentor</label>
                                <select value={formData.mentorId} onChange={e => setFormData({...formData, mentorId: e.target.value})} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                                     <option value="" disabled>Select Mentor</option>
                                    {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Session Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Topic</label>
                            <input type="text" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Notes</label>
                            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={4} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Rating</label>
                            <StarRatingInput rating={formData.rating} setRating={r => setFormData({...formData, rating: r})} />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Save Session</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const IncubationMentorshipPage: React.FC<IncubationMentorshipPageProps> = ({ incubationData }) => {
    const { t, language, dir } = useLocalization();
    const toast = useToast();
    
    const [sessions, setSessions] = useState(incubationData.mentorshipSessions.map(s => ({ ...s, deleted: false })));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<MentorshipSession | null>(null);

    const { startups, mentors } = incubationData;

    const enrichedSessions = useMemo(() => {
        return sessions
            .filter(s => !s.deleted)
            .map(session => {
                const startup = startups.find(s => s.id === session.startupId);
                const mentor = mentors.find(m => m.id === session.mentorId);
                return {
                    ...session,
                    startupName: startup?.name || 'Unknown Startup',
                    founderName: startup?.founder.name || 'Unknown Founder',
                    mentorName: mentor?.name || 'Unknown Mentor',
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions, startups, mentors]);

    const handleOpenModal = (session?: MentorshipSession) => {
        setEditingSession(session || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
    };

    const handleSaveSession = (sessionData: Omit<MentorshipSession, 'id'> | MentorshipSession) => {
        if ('id' in sessionData) {
            // Edit
            setSessions(prev => prev.map(s => s.id === sessionData.id ? { ...s, ...sessionData } : s));
            toast.showSuccess("Session updated successfully!");
        } else {
            // Add
            const newSession = { ...sessionData, id: `sess-${Date.now()}`, date: `${sessionData.date}T00:00:00Z`, deleted: false };
            setSessions(prev => [newSession, ...prev]);
            toast.showSuccess("New session added successfully!");
        }
        handleCloseModal();
    };

    const handleDelete = (sessionId: string) => {
        if (window.confirm("Are you sure you want to delete this session record? This action is reversible.")) {
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, deleted: true } : s));
            toast.showInfo("Session record moved to trash.");
        }
    };

    return (
        <>
            <SessionModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSession}
                session={editingSession}
                startups={startups}
                mentors={mentors}
            />
            <div data-view-id="incubation_mentorship.sessions" className="space-y-6 animate-fade-in" dir={dir}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t('incubation_mentorship.title')}</h1>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                        <PlusCircle size={18} /> Add Session
                    </button>
                </div>

                <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft overflow-hidden border dark:border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-card/50">
                                <tr>
                                    <th className="p-4">{t('incubation_mentorship.sessionDate')}</th>
                                    <th className="p-4">{t('incubation_mentorship.topic')}</th>
                                    <th className="p-4">{t('incubation_mentorship.founder')}</th>
                                    <th className="p-4">{t('incubation_mentorship.mentor')}</th>
                                    <th className="p-4">{t('incubation_mentorship.rating')}</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-foreground dark:text-dark-foreground">
                                {enrichedSessions.map(session => (
                                    <tr key={session.id} className="border-t dark:border-slate-700">
                                        <td className="p-4">{formatDate(session.date, language)}</td>
                                        <td className="p-4 font-semibold">{session.topic}</td>
                                        <td className="p-4">{session.founderName} ({session.startupName})</td>
                                        <td className="p-4">{session.mentorName}</td>
                                        <td className="p-4"><StarRatingDisplay rating={session.rating} /></td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenModal(session)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full" title="Edit Session">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(session.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-full" title="Delete Session">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {enrichedSessions.length === 0 && (
                            <div className="text-center p-8 text-gray-500">No mentorship sessions recorded yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default IncubationMentorshipPage;