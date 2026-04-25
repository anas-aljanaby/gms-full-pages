import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { HrData, Project, Event, Volunteer, VolunteerSkill, VolunteerAvailability, VolunteerPerformance, VolunteerAssignment } from '../../../types';
import { calculateAIMatchScore } from '../../../lib/aiVolunteerMatcher';
import { XIcon, PlusCircleIcon, SparklesIcon } from '../../icons/GenericIcons';
import Spinner from '../../common/Spinner';

interface SchedulingTabProps {
    hrData: HrData;
    projects: Project[];
    events: Event[];
}

interface RoleRequirement {
    id: number;
    name: string;
    count: number;
    skills: string[];
}

interface Recommendation {
    volunteer: Volunteer;
    score: number;
}

const SchedulingTab: React.FC<SchedulingTabProps> = ({ hrData, projects, events }) => {
    const { t, language } = useLocalization();
    const [eventName, setEventName] = useState('');
    const [programId, setProgramId] = useState('');
    const [requiredRoles, setRequiredRoles] = useState<RoleRequirement[]>([{ id: 1, name: '', count: 1, skills: [] }]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});

    const allSkills = useMemo(() => Array.from(new Set(hrData.skills.map(s => s.skill_name))), [hrData.skills]);

    const addRole = () => setRequiredRoles([...requiredRoles, { id: Date.now(), name: '', count: 1, skills: [] }]);
    const removeRole = (id: number) => setRequiredRoles(requiredRoles.filter(r => r.id !== id));
    
    const handleRoleChange = (id: number, field: keyof RoleRequirement, value: any) => {
        setRequiredRoles(requiredRoles.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleAiAssign = () => {
        setIsAiLoading(true);
        setRecommendations({});
        // Simulate API call and matching process
        setTimeout(() => {
            const newRecommendations: Record<string, Recommendation[]> = {};
            requiredRoles.forEach(role => {
                const candidates = hrData.volunteers
                    .map(volunteer => {
                        const score = calculateAIMatchScore(
                            volunteer,
                            hrData.skills.filter(s => s.volunteer_id === volunteer.volunteer_id),
                            hrData.availability.filter(a => a.volunteer_id === volunteer.volunteer_id),
                            hrData.performance.find(p => p.volunteer_id === volunteer.volunteer_id),
                            hrData.assignments,
                            role.skills,
                            new Date(), // Assuming today for simplicity
                            '09:00',
                            '17:00',
                            programId
                        );
                        return { volunteer, score };
                    })
                    .filter(c => c.score > 50) // Threshold
                    .sort((a, b) => b.score - a.score);
                
                newRecommendations[role.id] = candidates;
            });
            setRecommendations(newRecommendations);
            setIsAiLoading(false);
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
            {/* Left Panel: Form */}
            <div className="lg:col-span-2 bg-card dark:bg-dark-card rounded-2xl shadow-soft border p-6 space-y-4">
                <h3 className="text-xl font-bold">{t('hr.scheduling.createTitle')}</h3>
                <div>
                    <label className="text-sm font-medium">{t('hr.scheduling.eventName')}</label>
                    <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                </div>
                <div>
                    <label className="text-sm font-medium">{t('hr.scheduling.program')}</label>
                    <select value={programId} onChange={e => setProgramId(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                        <option value="">{t('hr.scheduling.selectProgram')}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                    </select>
                </div>
                 <div>
                    <h4 className="text-sm font-medium mb-2">{t('hr.scheduling.requiredRoles')}</h4>
                    <div className="space-y-3">
                        {requiredRoles.map(role => (
                            <div key={role.id} className="p-3 border rounded-lg dark:border-slate-600">
                                <div className="flex gap-2 items-center">
                                    <input type="text" placeholder={t('hr.scheduling.roleName')} value={role.name} onChange={e => handleRoleChange(role.id, 'name', e.target.value)} className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                                    <input type="number" value={role.count} min="1" onChange={e => handleRoleChange(role.id, 'count', Number(e.target.value))} className="w-16 p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                                    <button onClick={() => removeRole(role.id)}><XIcon className="w-5 h-5 text-red-500"/></button>
                                </div>
                                 <div className="mt-2">
                                     <label className="text-xs font-medium">{t('hr.scheduling.requiredSkills')}</label>
                                     <select multiple value={role.skills} onChange={e => handleRoleChange(role.id, 'skills', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="w-full h-20 p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                        {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                                     </select>
                                 </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={addRole} className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary"><PlusCircleIcon/> {t('hr.scheduling.addRole')}</button>
                </div>
                <button onClick={handleAiAssign} disabled={isAiLoading} className="w-full flex items-center justify-center gap-2 py-3 text-lg font-bold text-white bg-primary rounded-lg disabled:bg-gray-400">
                    {isAiLoading ? <Spinner/> : <SparklesIcon />} {t('hr.scheduling.aiAssign')}
                </button>
            </div>

            {/* Right Panel: Recommendations */}
            <div className="lg:col-span-3 bg-card dark:bg-dark-card rounded-2xl shadow-soft border p-6">
                <h3 className="text-xl font-bold mb-4">{t('hr.scheduling.recommendations')}</h3>
                {isAiLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner text={t('common.analyzing') + '...'} />
                    </div>
                ) : Object.keys(recommendations).length > 0 ? (
                     <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {requiredRoles.map(role => (
                            <div key={role.id}>
                                <h4 className="font-bold text-lg mb-2">{role.name} ({t('hr.scheduling.numVolunteers')}: {role.count})</h4>
                                <div className="space-y-4">
                                {recommendations[role.id]?.slice(0, 3).map((rec, index) => (
                                    <div key={rec.volunteer.volunteer_id} className="p-4 border-2 rounded-xl bg-gray-50 dark:bg-slate-800/50" style={{borderColor: `hsl(${120 - index*20}, 70%, 80%)`}}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <img src={rec.volunteer.photo_url} className="w-12 h-12 rounded-full"/>
                                                <div>
                                                    <p className="font-bold">{rec.volunteer.full_name}</p>
                                                    <p className="text-xs text-gray-500">⭐ {hrData.performance.find(p=>p.volunteer_id === rec.volunteer.volunteer_id)?.average_rating || 'N/A'}/5.0 | ⏱️ {hrData.performance.find(p=>p.volunteer_id === rec.volunteer.volunteer_id)?.total_hours || 0} hrs</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl">{rec.score}% Match</p>
                                                {index === 0 && <p className="text-xs font-bold text-green-500">🏆 Best Match</p>}
                                            </div>
                                        </div>
                                        <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-md text-xs space-y-1">
                                            <p><strong className="text-green-600">✓ AI Reasoning:</strong> Strong skill match and high past performance in similar roles.</p>
                                            <p><strong className="text-green-600">✓ Skills:</strong> {role.skills.join(', ')}</p>
                                            <p><strong className="text-green-600">✓ Available:</strong> Yes</p>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button className="px-3 py-1 text-xs font-semibold border rounded-md">View Profile</button>
                                            <button className="px-3 py-1 text-xs font-semibold text-white bg-secondary rounded-md">Select</button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ))}
                     </div>
                ) : (
                    <div className="text-center text-gray-500 py-20">
                        <p>{t('hr.scheduling.recommendationPlaceholder')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulingTab;