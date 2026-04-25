import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Calendar, DollarSign, Users2, MapPin, ChevronDown, X as XIcon } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { MOCK_PROJECTS as ALL_SYSTEM_PROJECTS } from '../../../data/projectData';

type ProjectStatus = 'مكتمل' | 'جاري التنفيذ' | 'متوقف';
type Project = {
    status: ProjectStatus;
    name: string;
    sector: string;
    duration: string;
    budget: number;
    beneficiaries: number;
    location: string;
    progress: number;
};

const mockProjects: Project[] = [
    { status: 'مكتمل', name: "برنامج محو الأمية للكبار", sector: 'التعليم', duration: "يناير 2023 - ديسمبر 2023", budget: 50000, beneficiaries: 500, location: "الرياض", progress: 100 },
    { status: 'جاري التنفيذ', name: "بناء مركز صحي مجتمعي", sector: 'الصحة', duration: "مارس 2024 - سبتمبر 2024", budget: 120000, beneficiaries: 2000, location: "جدة", progress: 65 },
    { status: 'جاري التنفيذ', name: "تدريب مهني للشباب", sector: 'التنمية', duration: "يناير 2024 - يونيو 2024", budget: 40000, beneficiaries: 150, location: "الدمام", progress: 80 },
    { status: 'مكتمل', name: "حملة تطعيم الأطفال", sector: 'الصحة', duration: "اكتمل في ديسمبر 2023", budget: 30000, beneficiaries: 10000, location: "مكة", progress: 100 },
    { status: 'مكتمل', name: "توزيع مستلزمات مدرسية", sector: 'التعليم', duration: "اكتمل في أغسطس 2023", budget: 15000, beneficiaries: 2500, location: "المدينة المنورة", progress: 100 },
    { status: 'متوقف', name: "برنامج الدعم النفسي", sector: 'الصحة', duration: "متوقف منذ فبراير 2024", budget: 25000, beneficiaries: 300, location: "أبها", progress: 40 },
];

const statusClasses: Record<ProjectStatus, { badge: string, bar: string }> = {
    'مكتمل': { badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', bar: 'bg-green-500' },
    'جاري التنفيذ': { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', bar: 'bg-blue-500' },
    'متوقف': { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', bar: 'bg-orange-500' },
};

const sectorClasses: Record<string, string> = {
    'التعليم': 'border-blue-500', 'الصحة': 'border-red-500', 'التنمية': 'border-purple-500',
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { language } = useLocalization();
    const statusConfig = statusClasses[project.status];
    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border-r-4 ${sectorClasses[project.sector] || 'border-gray-500'}`}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg mb-2">{project.name}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.badge}`}>{project.status}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2"><Tag size={14} />{project.sector}</p>
                <p className="flex items-center gap-2"><Calendar size={14} />{project.duration}</p>
                <p className="flex items-center gap-2"><DollarSign size={14} />{formatCurrency(project.budget, language)}</p>
                <p className="flex items-center gap-2"><Users2 size={14} />{project.beneficiaries} مستفيد</p>
                <p className="flex items-center gap-2"><MapPin size={14} />{project.location}</p>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>التقدم</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div className={`${statusConfig.bar} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>
             <button className="mt-4 w-full py-2 text-sm border border-gray-300 dark:border-slate-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                عرض التفاصيل
            </button>
        </motion.div>
    );
};

const LinkProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onLink: (projectId: string) => void; linkedProjectNames: string[] }> = ({ isOpen, onClose, onLink, linkedProjectNames }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const { t, language } = useLocalization();
    const { showWarning } = useToast();

    const availableProjects = useMemo(() => {
        return ALL_SYSTEM_PROJECTS.filter(p => !linkedProjectNames.includes(p.name.ar));
    }, [linkedProjectNames]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) {
            showWarning("الرجاء اختيار مشروع لربطه.");
            return;
        }
        onLink(selectedProjectId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">ربط مشروع جديد</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="project-select" className="block text-sm font-medium mb-2">اختر المشروع</label>
                        <select
                            id="project-select"
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                        >
                            <option value="" disabled>-- اختر من قائمة المشاريع --</option>
                            {availableProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name[language]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">إلغاء</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">ربط المشروع</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProjectsTab: React.FC = () => {
    const { t } = useLocalization();
    const { showSuccess } = useToast();
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [filter, setFilter] = useState('الكل');
    const [sort, setSort] = useState('الأحدث');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const filteredAndSortedProjects = useMemo(() => {
        let currentProjects = filter === 'الكل' ? projects : projects.filter(p => p.status === filter);
        currentProjects.sort((a, b) => {
            switch (sort) {
                case 'الأقدم': return new Date(a.duration.split(' - ')[0]).getTime() - new Date(b.duration.split(' - ')[0]).getTime();
                case 'حسب الميزانية': return b.budget - a.budget;
                case 'الأحدث':
                default:
                     return new Date(b.duration.split(' - ')[0]).getTime() - new Date(a.duration.split(' - ')[0]).getTime();
            }
        });
        return currentProjects;
    }, [filter, sort, projects]);
    
    const handleLinkProject = (projectId: string) => {
        const projectToLink = ALL_SYSTEM_PROJECTS.find(p => p.id === projectId);
        if (projectToLink) {
            const newProject: Project = {
                status: 'جاري التنفيذ',
                name: projectToLink.name.ar,
                sector: t(`projects.types.${projectToLink.type}`),
                duration: `${formatDate(projectToLink.plannedStartDate, 'ar', {month: 'long', year: 'numeric'})} - ${formatDate(projectToLink.plannedEndDate, 'ar', {month: 'long', year: 'numeric'})}`,
                budget: projectToLink.budget,
                beneficiaries: parseInt(projectToLink.stakeholders.targetBeneficiaries.replace(/\D/g, ''), 10) || 0,
                location: projectToLink.location.city,
                progress: projectToLink.progress,
            };
            setProjects(prev => [newProject, ...prev]);
            showSuccess(`تم ربط مشروع "${newProject.name}" بنجاح.`);
            setIsLinkModalOpen(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2">
                        {['الكل', 'جاري التنفيذ', 'مكتمل', 'متوقف'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-600 hover:bg-gray-200'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="relative">
                            <select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none p-2 pr-8 text-sm border rounded-lg bg-white dark:bg-slate-600 dark:border-slate-500">
                                <option>الأحدث</option>
                                <option>الأقدم</option>
                                <option>حسب الميزانية</option>
                            </select>
                            <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none" />
                        </div>
                         <button onClick={() => setIsLinkModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:underline">
                            ربط مشروع جديد
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedProjects.map(p => <ProjectCard key={p.name} project={p} />)}
                    </div>
                </AnimatePresence>
            </div>
            <LinkProjectModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onLink={handleLinkProject}
                linkedProjectNames={projects.map(p => p.name)}
            />
        </>
    );
};

export default ProjectsTab;