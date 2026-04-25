
import React, { useState, useMemo, useCallback } from 'react';
import type { IncubationData, Startup, StartupProgress, MilestoneStatus, CurriculumModule, CurriculumMilestone, Language } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { GoogleGenAI } from "@google/genai";
import { Bot, ChevronDown, Check, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../lib/utils';

const Spinner: React.FC<{ size?: string; text?: string; className?: string }> = ({ size = 'w-6 h-6', text, className='' }) => (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
        <svg className={`animate-spin text-primary dark:text-secondary ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <span className="text-sm font-semibold">{text}</span>}
    </div>
);


const MilestoneCard: React.FC<{
    milestone: CurriculumMilestone;
    progress: any; // MilestoneProgress or undefined
    onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
    moduleTitle: string;
}> = ({ milestone, progress, onStatusChange, moduleTitle }) => {
    const { t, language } = useLocalization();
    const toast = useToast();
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    const isDelayedFor7Days = useMemo(() => {
        if (progress?.status !== 'delayed' || !progress?.dueDate) return false;
        const dueDate = new Date(progress.dueDate);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return dueDate < sevenDaysAgo;
    }, [progress]);

    const handleGenerateFeedback = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoadingFeedback(true);
        setAiFeedback(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `A startup founder is delayed on the milestone '${milestone.title[language]}' which was due on ${formatDate(progress.dueDate, language)}. This milestone is part of the '${moduleTitle}' module. Provide a short, encouraging, and actionable feedback message in ${language} for the founder to help them get back on track. Do not add any introductory or concluding text, just the feedback itself.`;
            
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAiFeedback(response.text);
            toast.showSuccess(t('incubation.curriculum.aiFeedback.success'));
        } catch (error) {
            console.error("AI Feedback Error:", error);
            toast.showError(t('incubation.curriculum.aiFeedback.error'));
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    const statusIcons: Record<MilestoneStatus, React.ReactNode> = {
        completed: <Check className="w-4 h-4 text-green-500" />,
        pending: <Clock className="w-4 h-4 text-yellow-500" />,
        delayed: <AlertTriangle className="w-4 h-4 text-red-500" />,
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {statusIcons[progress?.status || 'pending']}
                    <p className="font-semibold text-foreground dark:text-dark-foreground">{milestone.title[language]}</p>
                </div>
                <select 
                    value={progress?.status || 'pending'} 
                    onChange={(e) => onStatusChange(milestone.id, e.target.value as MilestoneStatus)}
                    onClick={e => e.stopPropagation()}
                    className="p-1 text-xs border rounded-md bg-gray-50 dark:bg-slate-700"
                >
                    <option value="pending">{t('incubation.curriculum.status.pending')}</option>
                    <option value="completed">{t('incubation.curriculum.status.completed')}</option>
                    <option value="delayed">{t('incubation.curriculum.status.delayed')}</option>
                </select>
            </div>
            <p className="text-xs text-gray-500 mt-1 ps-6">{milestone.description[language]}</p>
            {isDelayedFor7Days && (
                <div className="mt-2 ps-6">
                    <button onClick={handleGenerateFeedback} disabled={isLoadingFeedback} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
                        {isLoadingFeedback ? <Spinner size="w-3 h-3" /> : <Bot size={14} />}
                        {isLoadingFeedback ? t('incubation.curriculum.aiFeedback.generating') : t('incubation.curriculum.aiFeedback.button')}
                    </button>
                </div>
            )}
            {aiFeedback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs italic text-blue-800 dark:text-blue-200">
                    {aiFeedback}
                </motion.div>
            )}
        </div>
    );
};

const ModuleCard: React.FC<{
    module: CurriculumModule;
    progressData: any;
    onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
}> = ({ module, progressData, onStatusChange }) => {
    const { t, language } = useLocalization();
    const [isOpen, setIsOpen] = useState(module.week === 1);
    
    return (
        <div className="bg-card dark:bg-dark-card rounded-xl shadow-sm border dark:border-slate-700/50 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-start bg-gray-50 dark:bg-dark-card/50 hover:bg-gray-100 dark:hover:bg-slate-700/50">
                <h4 className="font-bold text-foreground dark:text-dark-foreground">{module.title[language]}</h4>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown /></motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-t dark:border-slate-700 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{module.description[language]}</p>
                            {module.milestones.map(milestone => (
                                <MilestoneCard 
                                    key={milestone.id} 
                                    milestone={milestone} 
                                    progress={progressData[milestone.id]}
                                    onStatusChange={onStatusChange}
                                    moduleTitle={module.title[language]}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const WeekSection: React.FC<{
    weekNumber: number;
    modules: CurriculumModule[];
    progressMap: any;
    onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
}> = ({ weekNumber, modules, progressMap, onStatusChange }) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(weekNumber <= 4);
    
    return (
        <div className="border-b dark:border-slate-800 last:border-b-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-lg font-bold text-foreground dark:text-dark-foreground hover:bg-gray-50 dark:hover:bg-dark-card/30">
                <span>{t('incubation.curriculum.week')} {weekNumber}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown /></motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {modules && modules.length > 0 ? (
                                modules.map(module => (
                                    <ModuleCard 
                                        key={module.milestones[0]?.id || module.week}
                                        module={module}
                                        progressData={progressMap}
                                        onStatusChange={onStatusChange}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 px-4">No modules scheduled for this week.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const IncubationCurriculumPage: React.FC<{ incubationData: IncubationData }> = ({ incubationData }) => {
    const { t, dir, language } = useLocalization();
    const { startups, curriculum, startupProgress } = incubationData;
    
    const [selectedStartupId, setSelectedStartupId] = useState<string>(startupProgress[0]?.startupId || startups[0]?.id || '');
    const [progressData, setProgressData] = useState<StartupProgress[]>(startupProgress);

    const handleStatusChange = useCallback((milestoneId: string, status: MilestoneStatus) => {
        setProgressData(prevData => {
            return prevData.map(sp => {
            if (sp.startupId === selectedStartupId) {
                const newMilestoneProgress = sp.milestoneProgress.map(mp => {
                if (mp.milestoneId === milestoneId) {
                    return { ...mp, status, completionDate: status === 'completed' ? new Date().toISOString() : undefined };
                }
                return mp;
                });
                return { ...sp, milestoneProgress: newMilestoneProgress };
            }
            return sp;
            });
        });
    }, [selectedStartupId]);

    const selectedStartup = useMemo(() => {
        return startups.find(s => s.id === selectedStartupId);
    }, [selectedStartupId, startups]);
    
    const { overallProgress, progressMap } = useMemo(() => {
        const currentProgress = progressData.find(p => p.startupId === selectedStartupId);
        if (!currentProgress || !curriculum) return { overallProgress: 0, progressMap: {} };

        const progressMap = currentProgress.milestoneProgress.reduce((acc, p) => {
            acc[p.milestoneId] = p;
            return acc;
        }, {} as Record<string, any>);

        const totalMilestones = curriculum.flatMap(m => m.milestones).length;
        const completedMilestones = currentProgress.milestoneProgress.filter(p => p.status === 'completed').length;
        const overallProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

        return { overallProgress, progressMap };
    }, [selectedStartupId, progressData, curriculum]);

    const modulesByWeek = useMemo(() => {
        return (curriculum || []).reduce((acc, module) => {
            (acc[module.week] = acc[module.week] || []).push(module);
            return acc;
        }, {} as Record<number, CurriculumModule[]>);
    }, [curriculum]);

    return (
        <div data-view-id="incubation_curriculum.timeline" className="space-y-6 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">{t('incubation.curriculum.title')}</h1>
            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <label className="font-semibold text-foreground dark:text-dark-foreground">{t('incubation.curriculum.selectFounder')}</label>
                    <select value={selectedStartupId} onChange={e => setSelectedStartupId(e.target.value)} className="w-full md:w-auto p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                        {startups.map(s => <option key={s.id} value={s.id}>{s.founder.name} ({s.name})</option>)}
                    </select>
                </div>
                {selectedStartup && (
                    <div className="mt-4">
                        <h2 className="font-bold text-lg text-foreground dark:text-dark-foreground">{selectedStartup.name} - {t('incubation.curriculum.overallProgress')}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                                <div className="bg-primary h-4 rounded-full text-center text-white text-xs leading-4 transition-all duration-500" style={{ width: `${overallProgress}%` }}>
                                    {overallProgress > 10 ? `${Math.round(overallProgress)}%` : ''}
                                </div>
                            </div>
                            <span className="font-bold text-primary dark:text-secondary">{Math.round(overallProgress)}%</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50">
                {Array.from({ length: 24 }, (_, i) => i + 1).map(weekNumber => (
                    <WeekSection
                        key={weekNumber}
                        weekNumber={weekNumber}
                        modules={modulesByWeek[weekNumber] || []}
                        progressMap={progressMap}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default IncubationCurriculumPage;
