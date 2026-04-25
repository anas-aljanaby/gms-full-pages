
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../../hooks/useLocalization';
import type { IncubationData, Language, MilestoneStatus, StageData, StartupProgress } from '../../../types';
import { Lightbulb, CheckCircle, Rocket, BarChart, DollarSign, ChevronDown, Bot, Sparkles, X as XIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';

const initialRoadmapStages: Omit<StageData, 'progress'>[] = [
  {
    "id": "idea",
    "icon": "Lightbulb",
    "title": { "en": "Idea & Conception", "ar": "الفكرة والتصور", "tr": "Fikir ve Konsept" },
    "description": { "en": "Refining the initial idea, identifying the problem, and defining the core value proposition.", "ar": "صقل الفكرة الأولية، تحديد المشكلة، وتعريف القيمة الأساسية المقترحة.", "tr": "İlk fikri iyileştirme, sorunu belirleme ve temel değer önerisini tanımlama." },
    "keyActivities": {
      "en": ["Market Research", "Problem Validation", "Solution Brainstorming", "Initial Team Formation"],
      "ar": ["بحث السوق", "التحقق من المشكلة", "عصف ذهني للحلول", "تشكيل الفريق الأولي"],
      "tr": ["Pazar Araştırması", "Sorun Doğrulama", "Çözüm Beyin Fırtınası", "İlk Ekip Oluşturma"]
    },
    "linkedModule": "incubation_application"
  },
  {
    "id": "validation",
    "icon": "CheckCircle",
    "title": { "en": "Validation & Prototyping", "ar": "التحقق والنمذجة الأولية", "tr": "Doğrulama ve Prototipleme" },
    "description": { "en": "Validating the solution with potential customers and building a low-fidelity prototype or mockups.", "ar": "التحقق من الحل مع العملاء المحتملين وبناء نموذج أولي منخفض الدقة أو نماذج بالحجم الطبيعي.", "tr": "Potansiyel müşterilerle çözümü doğrulama ve düşük kaliteli bir prototip veya maket oluşturma." },
    "keyActivities": {
      "en": ["Customer Interviews", "Landing Page Tests", "Wireframing & Mockups", "Feedback Analysis"],
      "ar": ["مقابلات العملاء", "اختبارات صفحة الهبوط", "النماذج الشبكية والنماذج بالحجم الطبيعي", "تحليل الملاحظات"],
      "tr": ["Müşteri Görüşmeleri", "Açılış Sayfası Testleri", "Tel Çerçeveleme ve Maketler", "Geri Bildirim Analizi"]
    },
    "linkedModule": "incubation_screening"
  },
  {
    "id": "mvp",
    "icon": "Rocket",
    "title": { "en": "MVP & Launch", "ar": "المنتج الأولي والإطلاق", "tr": "MVP ve Lansman" },
    "description": { "en": "Developing the Minimum Viable Product (MVP) and launching it to an initial set of users.", "ar": "تطوير المنتج الأولي القابل للتطبيق (MVP) وإطلاقه لمجموعة أولية من المستخدمين.", "tr": "Minimum Uygulanabilir Ürünü (MVP) geliştirme ve ilk kullanıcı grubuna sunma." },
    "keyActivities": {
      "en": ["Agile Development Sprints", "Beta Testing", "Go-to-Market Strategy", "Initial User Acquisition"],
      "ar": ["التطوير المرن (Sprints)", "اختبار بيتا", "استراتيجية الذهاب إلى السوق", "اكتساب المستخدمين الأولي"],
      "tr": ["Çevik Geliştirme Sprintleri", "Beta Testi", "Pazara Giriş Stratejisi", "İlk Kullanıcı Kazanımı"]
    },
    "linkedModule": "incubation_curriculum"
  },
  {
    "id": "growth",
    "icon": "BarChart",
    "title": { "en": "Growth & Scaling", "ar": "النمو والتوسع", "tr": "Büyüme ve Ölçeklenme" },
    "description": { "en": "Focusing on user acquisition, retention, and scaling the technical infrastructure and operations.", "ar": "التركيز على اكتساب المستخدمين، والاحتفاظ بهم، وتوسيع البنية التحتية التقنية والعمليات.", "tr": "Kullanıcı kazanımı, elde tutma ve teknik alapı ile operasyonları ölçeklendirmeye odaklanma." },
    "keyActivities": {
      "en": ["KPI Tracking & Analysis", "User Feedback Loops", "Marketing & Sales Campaigns", "Operational Scaling"],
      "ar": ["تتبع وتحليل مؤشرات الأداء", "حلقات ملاحظات المستخدم", "حملات التسويق والمبيعات", "التوسع التشغيلي"],
      "tr": ["KPI Takibi ve Analizi", "Kullanıcı Geri Bildirim Döngüleri", "Pazarlama ve Satış Kampanyaları", "Operasyonel Ölçeklendirme"]
    },
    "linkedModule": "incubation_impact"
  },
  {
    "id": "funding",
    "icon": "DollarSign",
    "title": { "en": "Funding & Investment", "ar": "التمويل والاستثمار", "tr": "Finansman ve Yatırım" },
    "description": { "en": "Preparing for and securing seed or Series A funding to accelerate growth.", "ar": "التحضير لتأمين التمويل الأولي أو السلسلة أ لتسريع النمو.", "tr": "Büyümeyi hızlandırmak için başlangıç veya Seri A finansmanı hazırlama ve sağlama." },
    "keyActivities": {
      "en": ["Pitch Deck Refinement", "Investor Outreach", "Due Diligence Preparation", "Negotiation & Closing"],
      "ar": ["صقل عرض المستثمر", "التواصل مع المستثمرين", "التحضير للعناية الواجبة", "التفاوض والإغلاق"],
      "tr": ["Sunum Güvertesi İyileştirme", "Yatırımcı İlişkileri", "Durum Tespiti Hazırlığı", "Müzakere ve Kapanış"]
    },
    "linkedModule": "incubation_investors"
  }
];

const stageIcons: Record<string, React.ElementType> = {
    Lightbulb, CheckCircle, Rocket, BarChart, DollarSign
};

interface IncubationRoadmapPageProps {
    incubationData: IncubationData;
    setActiveModule: (module: string) => void;
}

const AiSummaryModal: React.FC<{ isOpen: boolean; onClose: () => void; content: string; isLoading: boolean }> = ({ isOpen, onClose, content, isLoading }) => {
    const { t } = useLocalization();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-primary"/> {t('incubation.roadmap.aiSummaryTitle')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? <Spinner text={t('common.generating')} /> : <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{__html: content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />}
                </div>
            </div>
        </div>
    );
};

const IncubationRoadmapPage: React.FC<IncubationRoadmapPageProps> = ({ incubationData, setActiveModule }) => {
    const { language, dir, t } = useLocalization();
    const toast = useToast();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'icons' | 'list'>(
        () => (localStorage.getItem('incubationRoadmapViewMode') as 'icons' | 'list') || 'icons'
    );

    useEffect(() => {
        localStorage.setItem('incubationRoadmapViewMode', viewMode);
    }, [viewMode]);
    
    const [roadmapData, setRoadmapData] = useState<StageData[]>(() =>
        initialRoadmapStages.map(s => ({ ...s, progress: 0 }))
    );
    const [overallProgress, setOverallProgress] = useState(0);

    const calculateAllProgress = useCallback(() => {
        const { applications, curriculum, startupProgress, startups } = incubationData;

        const stage1Progress = 100; // Application stage is always considered ready.

        const reviewedApps = applications.filter(a => a.status === 'Accepted' || a.status === 'Rejected').length;
        const stage2Progress = applications.length > 0 ? (reviewedApps / applications.length) * 100 : 0;
        
        const totalMilestones = curriculum.flatMap(m => m.milestones).length;
        let totalCompletedMilestones = 0;
        const activeStartupIds = startups.filter(s => s.status === 'active').map(s => s.id);
        const relevantStartupProgress = startupProgress.filter(sp => activeStartupIds.includes(sp.startupId));
        
        relevantStartupProgress.forEach(sp => {
            totalCompletedMilestones += sp.milestoneProgress.filter(mp => mp.status === 'completed').length;
        });
        const stage3Progress = (totalMilestones > 0 && relevantStartupProgress.length > 0)
            ? (totalCompletedMilestones / (totalMilestones * relevantStartupProgress.length)) * 100 : 0;

        const activeStartups = startups.filter(s => s.status === 'active');
        const growthStartups = activeStartups.filter(s => s.stage === 'growth').length;
        const stage4Progress = activeStartups.length > 0 ? (growthStartups / activeStartups.length) * 100 : 0;

        const fundedStartups = activeStartups.filter(s => s.funding > 0).length;
        const stage5Progress = activeStartups.length > 0 ? (fundedStartups / activeStartups.length) * 100 : 0;

        const progressValues = [stage1Progress, stage2Progress, stage3Progress, stage4Progress, stage5Progress];
        
        const updatedStages = initialRoadmapStages.map((stage, index) => ({
            ...stage,
            progress: Math.min(100, Math.round(progressValues[index])),
        }));
        
        setRoadmapData(updatedStages);
        const total = updatedStages.reduce((sum, stage) => sum + stage.progress, 0);
        setOverallProgress(Math.round(total / updatedStages.length));
    }, [incubationData]);

    useEffect(() => {
        calculateAllProgress();
        const intervalId = setInterval(calculateAllProgress, 30000);
        return () => clearInterval(intervalId);
    }, [calculateAllProgress]);

    const getReadinessStat = useCallback((stage: StageData | null): string => {
        if (!stage) return "";
        const { applications, startups, curriculum, startupProgress } = incubationData;
        
        switch(stage.id) {
            case 'idea':
                return `Application portal is live. ${applications.length} applications received so far.`;
            case 'validation':
                const reviewedApps = applications.filter(a => a.status !== 'Pending').length;
                return `${reviewedApps} out of ${applications.length} applications have been screened.`;
            case 'mvp':
                 const totalMilestones = curriculum.flatMap(m => m.milestones).length;
                 const activeStartupIds = startups.filter(s => s.status === 'active').map(s => s.id);
                 const relevantStartupProgress = startupProgress.filter(sp => activeStartupIds.includes(sp.startupId));
                 let totalCompletedMilestones = 0;
                 relevantStartupProgress.forEach(sp => {
                    totalCompletedMilestones += sp.milestoneProgress.filter(mp => mp.status === 'completed').length;
                 });
                const avgCompletion = (totalMilestones > 0 && relevantStartupProgress.length > 0) 
                ? (totalCompletedMilestones / (totalMilestones * relevantStartupProgress.length)) * 100 
                : 0;
                return `Average curriculum completion across startups is ${Math.round(avgCompletion)}%.`;
            case 'growth':
                const activeStartups = startups.filter(s => s.status === 'active');
                const growthStartups = activeStartups.filter(s => s.stage === 'growth').length;
                return `${growthStartups} of ${activeStartups.length} active startups have reached the growth stage.`;
            case 'funding':
                const activeStartupsFunded = startups.filter(s => s.status === 'active' && s.funding > 0).length;
                const totalActive = startups.filter(s => s.status === 'active').length;
                return `${activeStartupsFunded} of ${totalActive} active startups have secured initial funding.`;
            default:
                return "No data available for this stage.";
        }
    }, [incubationData]);

    const handleGenerateSummary = async () => {
        setIsAiModalOpen(true);
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are a startup incubator advisor. Based on the provided roadmap stages and their progress, generate a concise summary in ${language} about the overall journey. Highlight the current focus and what's next. Use markdown for formatting.`;
            const prompt = `Incubation Roadmap: ${JSON.stringify(roadmapData.map(s => ({ title: s.title.en, progress: s.progress })))}`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction }});
            setAiSummary(response.text);
        } catch (error) {
            console.error("AI summary error:", error);
            setAiSummary("Failed to generate summary.");
            toast.showError("Failed to generate summary.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const activeStageIndex = useMemo(() => {
        const index = roadmapData.findIndex(s => s.progress < 100);
        return index === -1 ? roadmapData.length - 1 : index;
    }, [roadmapData]);

    const expandedStage = expandedStageId ? roadmapData.find(s => s.id === expandedStageId) : null;
    
    const getProgressGradient = (progress: number) => {
        if (progress === 100) return 'bg-gradient-to-r from-green-400 to-emerald-500';
        if (progress > 0) return 'bg-gradient-to-r from-blue-400 to-cyan-500';
        return 'bg-gray-300 dark:bg-slate-600';
    };

    const getBorderColor = (progress: number, isCurrent: boolean) => {
        if (isCurrent) return 'border-blue-500';
        if (progress === 100) return 'border-green-500';
        return 'border-gray-300 dark:border-slate-600';
    };
    
    const getTextColor = (progress: number, isCurrent: boolean) => {
        if (isCurrent) return 'text-blue-500';
        if (progress === 100) return 'text-green-500';
        return 'text-gray-400';
    };

    const ProgressRing: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
        const radius = 48;
        const stroke = 5;
        const normalizedRadius = radius - stroke;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <svg height={radius*2} width={radius*2} className="absolute inset-0">
                <circle stroke="#e6e6e6" className="dark:stroke-slate-700" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    transform={`rotate(-90 ${radius} ${radius})`}
                />
            </svg>
        );
    };

    return (
        <div data-view-id="incubation_roadmap.smartTimeline" className="space-y-6 animate-fade-in" dir={dir}>
            <AiSummaryModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} content={aiSummary} isLoading={isGenerating} />
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                    {t('incubation.roadmap.title')}
                </h1>
                <div className="flex items-center gap-2">
                     <button onClick={() => setViewMode(prev => prev === 'icons' ? 'list' : 'icons')} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">
                        {t('incubation.roadmap.toggleView')}
                    </button>
                    <button onClick={handleGenerateSummary} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg">
                        <Bot size={16}/> {t('incubation.roadmap.smartSummary')}
                    </button>
                </div>
            </div>
            
            <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
                <h3 className="font-bold mb-2">{t('incubation.roadmap.overallProgress')}</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                        <div className={`h-4 rounded-full transition-all duration-500 ${getProgressGradient(overallProgress)}`} style={{ width: `${overallProgress}%` }}></div>
                    </div>
                    <span className="font-bold text-lg">{overallProgress}%</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {viewMode === 'icons' ? (
                        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft">
                            <div className="flex flex-row flex-wrap justify-center sm:justify-between items-start gap-x-4 gap-y-12 py-8">
                                {roadmapData.map((stage, index) => {
                                    const Icon = stageIcons[stage.icon];
                                    const isCurrent = index === activeStageIndex;
                                    const isCompleted = stage.progress === 100;
                                    const color = isCurrent ? 'hsl(210, 80%, 60%)' : isCompleted ? 'hsl(145, 63%, 42%)' : 'hsl(220, 10%, 80%)';
                                    
                                    return (
                                        <button 
                                            key={stage.id} 
                                            onClick={() => setExpandedStageId(prev => prev === stage.id ? null : stage.id)}
                                            className="relative flex flex-col items-center w-32 text-center group focus:outline-none"
                                            aria-expanded={expandedStageId === stage.id}
                                        >
                                            <div className="relative w-28 h-28 flex items-center justify-center">
                                                <ProgressRing progress={stage.progress} color={color} />
                                                <Icon className={`w-12 h-12 transition-colors ${getTextColor(stage.progress, isCurrent)}`} />
                                                <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm border-4 border-card dark:border-dark-card ${isCurrent ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <p className={`font-bold text-sm mt-3 h-10 flex items-center justify-center ${getTextColor(stage.progress, isCurrent)}`}>{stage.title[language as Language]}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <AnimatePresence>
                                {expandedStage && (
                                    <motion.div
                                        key={expandedStage.id}
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: 'auto', opacity: 1, marginTop: '2rem' }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                                        className="bg-gray-50 dark:bg-dark-card/50 p-6 rounded-xl border dark:border-slate-700/50 overflow-hidden"
                                    >
                                        <h3 className="text-xl font-bold text-foreground dark:text-dark-foreground">{expandedStage.title[language]}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{expandedStage.description[language]}</p>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                             <div className="md:col-span-2">
                                                <h4 className="font-semibold mb-2">{t('incubation.roadmap.keyActivities')}</h4>
                                                <ul className="space-y-1 list-disc list-inside text-sm">
                                                    {expandedStage.keyActivities[language as Language].map((activity, i) => <li key={i}>{activity}</li>)}
                                                </ul>
                                            </div>
                                            <div className="flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-semibold mb-2">{t('incubation.roadmap.moduleReadiness')}</h4>
                                                    <p className="text-sm font-medium bg-primary-light/40 dark:bg-primary/20 p-2 rounded-md">{getReadinessStat(expandedStage)}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setActiveModule(expandedStage.linkedModule)}
                                                    className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                                                >
                                                    {t('incubation.go_to_module_button')}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {roadmapData.map((stage, index) => {
                                const Icon = stageIcons[stage.icon];
                                const isCurrent = index === activeStageIndex;
                                const isExpanded = expandedStageId === stage.id;
                                return (
                                    <div key={stage.id} className={`bg-card dark:bg-dark-card rounded-xl shadow-soft border-l-4 transition-all ${getBorderColor(stage.progress, isCurrent)} ${isExpanded ? 'ring-2 ring-primary' : ''}`}>
                                        <button onClick={() => setExpandedStageId(prev => prev === stage.id ? null : stage.id)} className="w-full p-4 text-start">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                                        <Icon className={`w-6 h-6 ${getTextColor(stage.progress, isCurrent)}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{stage.title[language]}</h3>
                                                        <p className="text-xs text-gray-500">Stage {index + 1}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-24 text-right">
                                                         <div className="flex justify-between items-center text-xs font-semibold mb-1">
                                                            <span>Progress</span>
                                                            <span>{stage.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                            <div className={`h-2 rounded-full transition-all duration-500 ${getProgressGradient(stage.progress)}`} style={{ width: `${stage.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                     <div className="p-4 border-t dark:border-slate-700/50 space-y-3">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description[language]}</p>
                                                        <div>
                                                            <h4 className="font-semibold text-sm mb-1">{t('incubation.roadmap.moduleReadiness')}</h4>
                                                            <p className="text-sm font-medium bg-primary-light/40 dark:bg-primary/20 p-2 rounded-md">{getReadinessStat(stage)}</p>
                                                        </div>
                                                         <div className="flex justify-end">
                                                            <button onClick={() => setActiveModule(stage.linkedModule)} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark">{t('incubation.go_to_module_button')}</button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default IncubationRoadmapPage;
