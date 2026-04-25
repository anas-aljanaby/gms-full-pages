
import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import {
    CalendarPlusIcon,
    PaperPlaneIcon,
    MegaphoneIcon,
    FileTextIcon,
    BarChartIcon,
    FileDownIcon,
} from '../../icons/MarketingIcons';

interface QuickActionsPanelProps {
    setActiveTab: (tabId: string) => void;
    onOpenCreatePostModal: () => void;
    onOpenSendEmailModal: () => void;
    onOpenCreateAdModal: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ 
    setActiveTab,
    onOpenCreatePostModal,
    onOpenSendEmailModal,
    onOpenCreateAdModal,
}) => {
    const { t } = useLocalization();
    const toast = useToast();

    const handlePublishBlog = () => {
        toast.showInfo('Blog publishing module is coming soon!', { title: t('toasts.infoTitle') });
    };

    const handleGenerateReport = () => {
        toast.showSuccess('Your report is being generated and will be available shortly.', { title: t('toasts.successTitle') });
    };

    const actions = [
        { label: t('digital_marketing.quickActions.sendEmail'), icon: <PaperPlaneIcon />, action: onOpenSendEmailModal },
        { label: t('digital_marketing.quickActions.scheduleSocial'), icon: <CalendarPlusIcon />, action: onOpenCreatePostModal },
        { label: t('digital_marketing.quickActions.publishBlog'), icon: <FileTextIcon />, action: handlePublishBlog },
        { label: t('digital_marketing.quickActions.createAd'), icon: <MegaphoneIcon />, action: onOpenCreateAdModal },
        { label: t('digital_marketing.quickActions.generateReport'), icon: <FileDownIcon />, action: handleGenerateReport },
        { label: t('digital_marketing.quickActions.viewAnalytics'), icon: <BarChartIcon />, action: () => setActiveTab('analytics') },
    ];

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft h-full border border-gray-200 dark:border-slate-700/50">
             <h3 className="text-lg font-bold p-4 border-b dark:border-slate-700">{t('digital_marketing.quickActions.title')}</h3>
             <div className="p-4 grid grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <button 
                        key={index} 
                        onClick={action.action}
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-center hover:bg-primary-light/50 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-secondary-light transition-all duration-200 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-700 rounded-full mb-2 group-hover:scale-110 transition-transform">
                             {action.icon}
                        </div>
                        <span className="text-xs font-semibold">{action.label}</span>
                    </button>
                ))}
             </div>
        </div>
    );
};

export default QuickActionsPanel;