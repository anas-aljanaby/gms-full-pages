import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { StudentProject, ProjectCategory } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatDate } from '../../../lib/utils';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../../../constants';
import { SearchIcon } from '../../icons/GenericIcons';
import { PlusCircleIcon } from '../../icons/GenericIcons';
import { MicrophoneIcon } from '../../icons/AiIcons';

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition; };
        webkitSpeechRecognition: { new(): SpeechRecognition; };
    }
}

interface StudentProjectsViewProps {
  projects: StudentProject[];
  dispatch: React.Dispatch<any>;
}

const KpiCard: React.FC<{ title: string; value: number; icon: string; suffix?: string }> = ({ title, value, icon, suffix }) => {
    const animatedValue = useCountUp(value);
    return (
        <div className="bg-card/50 dark:bg-dark-card/50 backdrop-blur-sm p-4 rounded-xl shadow-soft flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-2xl font-bold text-foreground dark:text-dark-foreground">{animatedValue}{suffix}</p>
            </div>
        </div>
    );
};

const StudentProjectsView: React.FC<StudentProjectsViewProps> = ({ projects, dispatch }) => {
    const { t, language, dir } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'all'>('all');

    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const toast = useToast();

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setMicError("Speech recognition is not supported in this browser.");
            return;
        }
        
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                const errorMsg = "Microphone permission was denied. Please enable it in your browser settings.";
                setMicError(errorMsg);
                toast.showError(errorMsg);
            }
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setSearchTerm(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [toast]);

    const handleListen = useCallback(() => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            return;
        }
        setMicError(null);
        const langCode = { en: 'en-US', ar: 'ar-SA', tr: 'tr-TR' }[language];
        recognitionRef.current.lang = langCode;
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Speech recognition start error:", e);
            const errorMsg = "Could not start listening. Please try again.";
            setMicError(errorMsg);
            toast.showError(errorMsg);
        }
    }, [isListening, language, toast]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            const matchesSearch = searchTerm === '' || 
                p.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.student.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [projects, searchTerm, categoryFilter, language]);

    const metrics = useMemo(() => {
        const active = projects.filter(p => p.status === 'active').length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const planned = projects.filter(p => p.status === 'planned').length;
        const totalImpact = projects.reduce((sum, p) => sum + (p.impact.beneficiaries || 0), 0);
        return { active, completed, planned, totalImpact };
    }, [projects]);

    const StatusBadge: React.FC<{ status: StudentProject['status'] }> = ({ status }) => {
        const statusMap = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            planned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusMap[status]}`}>{t(`leadership.projects.statuses.${status}`)}</span>;
    };
    
    const CategoryInfo = ({ category }: { category: ProjectCategory }) => {
      const info = PROJECT_CATEGORIES.find(c => c.id === category);
      if (!info) return null;
      const Icon = info.icon;
      return (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Icon />
              <span>{t(`leadership.projects.categories.${category}`)}</span>
          </div>
      );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard */}
            <div>
                <h2 className="text-xl font-bold mb-4">{t('leadership.projects.dashboardTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title={t('leadership.projects.activeProjects')} value={metrics.active} icon="🟢" />
                    <KpiCard title={t('leadership.projects.completedProjects')} value={metrics.completed} icon="🔵" />
                    <KpiCard title={t('leadership.projects.plannedProjects')} value={metrics.planned} icon="⚪" />
                    <KpiCard title={t('leadership.projects.totalImpact')} value={metrics.totalImpact} icon="👥" suffix={`+ ${t('leadership.projects.beneficiaries')}`}/>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="p-4 bg-card/50 dark:bg-dark-card/50 rounded-xl shadow-soft">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow">
                        <div className={`absolute inset-y-0 flex items-center ${dir === 'ltr' ? 'ps-3' : 'pe-3'} pointer-events-none`}>
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isListening ? t('ai_automation.ai_assistant.listening') : t('leadership.projects.searchPlaceholder')}
                            className={`block w-full p-2.5 ${dir === 'ltr' ? 'ps-10 pe-12' : 'pe-10 ps-12'} text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 focus:ring-primary focus:border-primary`}
                        />
                        <div className={`absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'left-3' : 'right-3'}`}>
                            <button
                                onClick={handleListen}
                                disabled={!!micError}
                                title={micError || "Search by voice"}
                                className={`p-2 rounded-full transition-colors disabled:text-gray-400 disabled:cursor-not-allowed ${
                                    isListening
                                        ? 'text-red-500 bg-red-100 dark:bg-red-900/50 animate-pulse'
                                        : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                         <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg transition-colors">
                            <PlusCircleIcon/> {t('leadership.projects.addNewProject')}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                     <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1 text-sm rounded-full transition-colors ${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>
                        {t('leadership.projects.allCategories')}
                    </button>
                    {PROJECT_CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${categoryFilter === cat.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>
                           {t(`leadership.projects.categories.${cat.id}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <div key={project.id} className="bg-card dark:bg-dark-card rounded-2xl shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-5 space-y-4 flex flex-col">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg text-foreground dark:text-dark-foreground">{project.title[language]}</h3>
                           <StatusBadge status={project.status} />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <img src={project.student.photo} alt={project.student.name} className="w-10 h-10 rounded-full" loading="lazy" />
                            <div>
                               <p className="text-xs text-gray-500">{t('leadership.projects.student')}</p>
                               <p className="font-semibold">{project.student.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm border-t border-b dark:border-slate-700 py-2">
                           <CategoryInfo category={project.category} />
                           <div>
                                <span className="text-gray-500">{t('leadership.projects.mentor')}: </span>
                                <span className="font-semibold">{project.mentor}</span>
                           </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1 text-sm">
                                <span className="font-medium">{t('leadership.projects.progress')}</span>
                                <span className="font-bold text-primary dark:text-secondary">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                                <div className="bg-primary dark:bg-secondary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>
                        
                         <div className="flex-grow"></div>
                        
                        <div className="flex justify-end">
                            <button className="px-4 py-2 text-sm font-semibold text-primary dark:text-secondary-light bg-primary-light dark:bg-secondary/20 rounded-lg hover:bg-primary/20 dark:hover:bg-secondary/30 transition-colors">
                                {t('leadership.projects.viewDetails')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentProjectsView;
