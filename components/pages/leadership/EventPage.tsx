import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { ChevronDownIcon } from '../../icons/GenericIcons';
import { 
    ArrowLeftIcon, 
    UserIcon, 
    TagIcon, 
    CalendarDaysIcon, 
    ClockIcon, 
    CircleDollarSignIcon,
    CheckIcon,
    TargetIcon,
    LightbulbIcon,
    BriefcaseIcon,
    HandshakeIcon,
    BookOpenIcon,
    CoffeeIcon,
    MessagesIcon,
    QrCodeIcon,
    FacebookIcon,
    TwitterIcon,
    LinkedInIcon,
    WhatsappIcon,
    CopyIcon
} from '../../icons/UtilityIcons';
import { eventTypeToIcon, WorkshopIcon, ActivityIcon } from '../../icons/LeadershipIcons';
import QrCodeModal from './QrCodeModal';
import { MediaIcon } from '../../icons/ModuleIcons';
import { Mail, Bell, CalendarPlus, Share2 } from 'lucide-react';

interface EventPageProps {
  event: Event;
  onBack: () => void;
  setActiveModule: (module: string) => void;
  setMediaFilter: (filter: string | null) => void;
}

// --- SUB-COMPONENTS ---

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-white/40 dark:border-white/10 transition-all duration-300 hover:-translate-y-2">
        <div className="flex items-center gap-3 text-primary dark:text-secondary">
            {icon}
            <h3 className="font-semibold text-foreground/80 dark:text-dark-foreground/80">{title}</h3>
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold text-foreground dark:text-dark-foreground">
            {children}
        </div>
    </div>
);

const ProgressTracker: React.FC<{ eventStatus: Event['status'] }> = ({ eventStatus }) => {
    const { t } = useLocalization();
    const stages = ['Registration', 'Attendance', 'Evaluation'];
    
    let currentStageIndex = 0;
    if (eventStatus === 'in-progress') currentStageIndex = 1;
    else if (eventStatus === 'completed') currentStageIndex = 2;

    return (
        <div className="w-full">
            <div className="relative flex justify-between items-center w-full">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-slate-700 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-500 ease-out" style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }} />

                {stages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    return (
                        <div key={stage} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isCompleted ? 'bg-teal-500 border-teal-500' : ''}
                                ${isCurrent ? 'bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse' : ''}
                                ${!isCompleted && !isCurrent ? 'bg-card dark:bg-dark-card border-gray-300 dark:border-slate-600' : ''}
                            `}>
                                {isCompleted && <CheckIcon className="w-5 h-5 text-white" />}
                            </div>
                            <span className="mt-2 text-xs font-semibold text-center">{stage}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-3xl shadow-soft border border-white/40 dark:border-white/10 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
                aria-expanded={isOpen}
            >
                <h2 className="text-2xl font-bold">{title}</h2>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDownIcon />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="pb-6 px-6">
                            {children}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};


const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const { t } = useLocalization();
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, hasFinished: false };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isLive: false,
                hasFinished: false,
            };
        } else if (difference < - (3 * 60 * 60 * 1000)) { // Assuming event lasts 3 hours
             timeLeft.hasFinished = true;
        } else {
            timeLeft.isLive = true;
        }

        return timeLeft;
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tracking-tighter">{String(value).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-widest">{label}</span>
        </div>
    );

    if (timeLeft.hasFinished) {
         return <div className="text-xl font-bold text-gray-500">{t('leadership.eventPage.countdown.finished')}</div>;
    }
    if (timeLeft.isLive) {
        return <div className="text-2xl font-bold text-green-500 animate-pulse">{t('leadership.eventPage.countdown.live')}</div>;
    }

    return (
        <div className="flex items-center justify-center gap-4 text-foreground dark:text-dark-foreground">
            <TimeUnit value={timeLeft.days} label={t('leadership.eventPage.countdown.days')} />
            <span>:</span>
            <TimeUnit value={timeLeft.hours} label={t('leadership.eventPage.countdown.hours')} />
            <span>:</span>
            <TimeUnit value={timeLeft.minutes} label={t('leadership.eventPage.countdown.minutes')} />
            <span>:</span>
            <TimeUnit value={timeLeft.seconds} label={t('leadership.eventPage.countdown.seconds')} />
        </div>
    );
};

// --- MAIN COMPONENT ---
const EventPage: React.FC<EventPageProps> = ({ event, onBack, setActiveModule, setMediaFilter }) => {
    const { t, language, dir } = useLocalization();
    const { theme } = useTheme();
    const toast = useToast();
    const EventTypeIcon = eventTypeToIcon[event.type];
    const [activeAgendaItem, setActiveAgendaItem] = useState<number | null>(1);
    const [isAttendanceQrOpen, setAttendanceQrOpen] = useState(false);
    const [isEvaluationQrOpen, setEvaluationQrOpen] = useState(false);
    
    const [notifications, setNotifications] = useState({ email: true, whatsapp: false });
    const [reminderTime, setReminderTime] = useState('day1');

    const attendanceCode = `ATT-${event.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const evaluationCode = `EVAL-${event.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const formatICSDate = (isoDateStr: string, timeStr?: string): string => {
        const date = new Date(isoDateStr.split('T')[0]);
        if (timeStr) {
            const [hours, minutes] = timeStr.split(':');
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventUrl = `https://example-erp.com/events/${event.id}`;
    const shareText = t('leadership.eventPage.share.shareText', { title: event.title[language], date: formatDate(event.date, language) });

    const getGoogleCalendarUrl = () => {
        const baseUrl = 'https://calendar.google.com/calendar/render';
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title[language],
            dates: `${formatICSDate(event.date, event.startTime)}/${formatICSDate(event.date, event.endTime)}`,
            details: event.description || '',
            location: event.location || '',
        });
        return `${baseUrl}?${params.toString()}`;
    };

    const handleDownloadIcs = () => {
        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
            `DTSTART:${formatICSDate(event.date, event.startTime)}`,
            `DTEND:${formatICSDate(event.date, event.endTime)}`,
            `SUMMARY:${event.title[language]}`,
            `DESCRIPTION:${event.description || ''}`,
            `LOCATION:${event.location || ''}`,
            'END:VEVENT', 'END:VCALENDAR'
        ].join('\n');
        
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.title.en.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(eventUrl).then(() => {
            toast.showSuccess(t('leadership.eventPage.share.linkCopied'), { title: 'Success' });
        });
    };

    const handleTestNotification = () => {
        toast.showInfo(t('leadership.eventPage.notifications.testToastMessage'), {
            title: t('leadership.eventPage.notifications.testToastTitle'),
        });
    };

    const duration = event.duration ? `${Math.floor(event.duration / 60)}h ${event.duration % 60}m` : (event.startTime && event.endTime ? '2h 0m' : 'N/A');
    
    const backgroundStyle = theme === 'dark'
        ? { backgroundColor: 'hsl(220 20% 12%)', backgroundImage: 'radial-gradient(hsl(220 20% 20%) 1px, transparent 0)', backgroundSize: '20px 20px' }
        : { backgroundColor: 'hsl(210 30% 98%)', backgroundImage: 'radial-gradient(hsl(210 20% 90%) 1px, transparent 0)', backgroundSize: '20px 20px' };

    const objectives = [
      { icon: <TargetIcon className="w-8 h-8" />, text: "Enhance strategic thinking and decision-making skills." },
      { icon: <LightbulbIcon className="w-8 h-8" />, text: "Foster innovation and creative problem-solving within teams." },
      { icon: <UserIcon className="w-8 h-8" />, text: "Improve interpersonal communication and team leadership." },
      { icon: <BriefcaseIcon className="w-8 h-8" />, text: "Develop skills for managing complex projects and resources." },
    ];
    
    const agenda = [
      { time: "09:00 - 09:30", title: "Welcome & Introduction", description: "Setting the stage for the day, outlining goals and expected outcomes.", icon: <HandshakeIcon /> },
      { time: "09:30 - 11:00", title: "Workshop: The Strategic Leader", description: "Interactive session on frameworks for strategic thinking and long-term planning.", icon: <WorkshopIcon /> },
      { time: "11:00 - 11:15", title: "Coffee Break", description: "A short break to network and recharge.", icon: <CoffeeIcon /> },
      { time: "11:15 - 12:45", title: "Group Activity: The Innovation Challenge", description: "Teams collaborate to solve a complex hypothetical business problem, focusing on creative solutions.", icon: <ActivityIcon /> },
      { time: "12:45 - 13:45", title: "Lunch Break", description: "Networking lunch.", icon: <CoffeeIcon /> },
      { time: "13:45 - 15:00", title: "Lecture: Communicating with Impact", description: "Keynote on effective communication strategies for leaders.", icon: <BookOpenIcon /> },
      { time: "15:00 - 15:15", title: "Wrap-up & Q&A", description: "Summary of key takeaways and open floor for questions.", icon: <MessagesIcon /> },
    ];
    const objectiveVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
        }),
    };

    return (
        <>
            <QrCodeModal
                isOpen={isAttendanceQrOpen}
                onClose={() => setAttendanceQrOpen(false)}
                title="Scan for Attendance"
                qrValue={`ATTENDANCE::${event.id}::${new Date().toISOString()}`}
                code={attendanceCode}
                color="green"
            />
            <QrCodeModal
                isOpen={isEvaluationQrOpen}
                onClose={() => setEvaluationQrOpen(false)}
                title="Scan for Evaluation"
                qrValue={`EVALUATION::${event.id}::${new Date().toISOString()}`}
                code={evaluationCode}
                color="blue"
            />

            <div className="space-y-6" style={backgroundStyle}>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeftIcon /> {t('projects.backToList')}
                </button>
                
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {event.title[language]}
                    </h1>
                    <div className="mt-4 flex justify-center">
                        <Countdown targetDate={event.date} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoCard icon={<UserIcon />} title={t('leadership.eventFacilitator')}>
                        <div className="flex items-center gap-3">
                            <img src={event.facilitator.photo} alt={event.facilitator.name} className="w-10 h-10 rounded-full" loading="lazy" />
                            <span>{event.facilitator.name}</span>
                        </div>
                    </InfoCard>
                    <InfoCard icon={<TagIcon />} title={t('leadership.calendar.form.eventType')}>
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-base rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary-light">
                            <EventTypeIcon />
                            {t(`leadership.eventTypes.${event.type}`)}
                        </span>
                    </InfoCard>
                    <InfoCard icon={<CalendarDaysIcon />} title={t('common.date')}>
                        {formatDate(event.date, language)}
                    </InfoCard>
                    <InfoCard icon={<ClockIcon />} title={t('common.time')}>
                        {duration}
                    </InfoCard>
                     <InfoCard icon={<CircleDollarSignIcon />} title={t('projects.wizard.form.budget')}>
                        {formatCurrency(event.budget || 0, language)}
                    </InfoCard>

                    <InfoCard icon={<MediaIcon />} title={t('leadership.eventPage.media.title')}>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-3">{t('leadership.eventPage.media.description')}</p>
                        <button
                            onClick={() => {
                                setMediaFilter(event.title.en);
                                setActiveModule('media_documentation');
                            }}
                            className="w-full px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            {t('leadership.eventPage.media.button')}
                        </button>
                    </InfoCard>

                    <div className="md:col-span-2 bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-white/40 dark:border-white/10 flex flex-col justify-center">
                        <h3 className="font-semibold text-center mb-4 text-foreground/80 dark:text-dark-foreground/80">Event Progress</h3>
                        <ProgressTracker eventStatus={event.status} />
                    </div>
                </div>

                <div className="space-y-6">
                    <CollapsibleSection title={t('leadership.eventPage.objectives')} defaultOpen>
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                            {objectives.map((obj, i) => (
                                <motion.div key={i} custom={i} variants={objectiveVariants} className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl flex items-center gap-4 border border-white/20 dark:border-white/10">
                                    <span className="text-primary dark:text-secondary flex-shrink-0">{obj.icon}</span>
                                    <p className="text-sm font-medium">{obj.text}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </CollapsibleSection>

                    <CollapsibleSection title={t('leadership.eventPage.agenda')} defaultOpen>
                        <div className="relative pl-8">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-slate-700" />
                            {agenda.map((item, index) => (
                                <div key={index} className="relative mb-4">
                                    <div className="absolute -left-5 top-1 w-6 h-6 rounded-full bg-card dark:bg-dark-card border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                    </div>
                                    <button onClick={() => setActiveAgendaItem(activeAgendaItem === index + 1 ? null : index + 1)} className="w-full text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="text-primary dark:text-secondary p-2 bg-gray-100 dark:bg-slate-800 rounded-full">{item.icon}</span>
                                            <div>
                                                <p className="text-xs font-semibold text-primary">{item.time}</p>
                                                <h4 className="font-bold">{item.title}</h4>
                                            </div>
                                        </div>
                                    </button>
                                    <AnimatePresence initial={false}>
                                    {activeAgendaItem === index + 1 && (
                                         <motion.div
                                            key="content"
                                            initial="collapsed"
                                            animate="open"
                                            exit="collapsed"
                                            variants={{
                                                open: { opacity: 1, height: 'auto', marginTop: '8px' },
                                                collapsed: { opacity: 0, height: 0, marginTop: '0px' }
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-sm text-gray-600 dark:text-gray-400 pl-11">{item.description}</p>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={t('leadership.eventPage.actions.title')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><CalendarPlus className="w-5 h-5" /> {t('leadership.eventPage.addToCalendar.title')}</h4>
                                    <div className="flex gap-2">
                                        <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2 text-sm font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50">{t('leadership.eventPage.addToCalendar.google')}</a>
                                        <button onClick={handleDownloadIcs} className="flex-1 px-4 py-2 text-sm font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50">{t('leadership.eventPage.addToCalendar.outlookApple')}</button>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Share2 className="w-5 h-5" /> {t('leadership.eventPage.share.title')}</h4>
                                    <div className="flex items-center gap-2">
                                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><WhatsappIcon /></a>
                                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-2 border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><TwitterIcon /></a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><FacebookIcon /></a>
                                        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(event.title[language])}&summary=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-2 border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><LinkedInIcon /></a>
                                        <button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-semibold border dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><CopyIcon className="w-4 h-4" />{t('leadership.eventPage.share.copyLink')}</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/10">
                                <h4 className="font-semibold mb-3 flex items-center gap-2"><Bell className="w-5 h-5" /> {t('leadership.eventPage.notifications.title')}</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4"/> {t('leadership.eventPage.notifications.email')}</span>
                                        <input type="checkbox" className="toggle" checked={notifications.email} onChange={e => setNotifications(n => ({...n, email: e.target.checked}))} />
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="flex items-center gap-2 text-sm"><WhatsappIcon className="w-4 h-4"/> {t('leadership.eventPage.notifications.whatsapp')}</span>
                                        <input type="checkbox" className="toggle" checked={notifications.whatsapp} onChange={e => setNotifications(n => ({...n, whatsapp: e.target.checked}))} />
                                    </label>
                                    <div className="pt-2">
                                        <label htmlFor="reminderTime" className="text-sm font-medium">{t('leadership.eventPage.notifications.remindMe')}:</label>
                                        <select id="reminderTime" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                            <option value="day1">{t('leadership.eventPage.notifications.timingOptions.day1')}</option>
                                            <option value="hour1">{t('leadership.eventPage.notifications.timingOptions.hour1')}</option>
                                            <option value="min30">{t('leadership.eventPage.notifications.timingOptions.min30')}</option>
                                        </select>
                                    </div>
                                    <button onClick={handleTestNotification} className="w-full mt-2 px-3 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">{t('leadership.eventPage.notifications.testButton')}</button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/10">
                                <QrCodeIcon className="w-8 h-8 text-green-600" />
                                <button onClick={() => setAttendanceQrOpen(true)} className="font-semibold">Show Attendance QR</button>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/10">
                                <QrCodeIcon className="w-8 h-8 text-blue-500" />
                                <button onClick={() => setEvaluationQrOpen(true)} className="font-semibold">Show Evaluation QR</button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
        </>
    );
};

export default EventPage;