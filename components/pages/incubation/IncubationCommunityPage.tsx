import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../../hooks/useLocalization';
import type { IncubationData } from '../../../types';
import { Users, Calendar, MessageSquare } from 'lucide-react';

interface IncubationCommunityPageProps {
    incubationData: IncubationData;
    setActiveModule: (module: string) => void;
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, buttonText, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 flex flex-col items-center text-center"
    >
        <div className="p-4 bg-primary-light dark:bg-primary/20 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground dark:text-dark-foreground">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow">{description}</p>
        <button onClick={onClick} className="mt-6 w-full px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
            {buttonText}
        </button>
    </motion.div>
);

const IncubationCommunityPage: React.FC<IncubationCommunityPageProps> = ({ incubationData, setActiveModule }) => {
    const { t, language, dir } = useLocalization();

    return (
        <div className="space-y-8 animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                {t('sidebar.incubation_network')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                {t('incubation.community.subtitle')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    icon={<Users className="w-8 h-8 text-primary dark:text-secondary" />}
                    title={t('incubation.founder_directory_label')}
                    description={t('incubation.community.founderDirectory.desc')}
                    buttonText={t('incubation.community.founderDirectory.button')}
                    onClick={() => setActiveModule('network_founders')}
                />
                <FeatureCard
                    icon={<Calendar className="w-8 h-8 text-primary dark:text-secondary" />}
                    title={t('incubation.upcoming_events_label')}
                    description={t('incubation.community.upcomingEvents.desc')}
                    buttonText={t('incubation.community.upcomingEvents.button')}
                    onClick={() => setActiveModule('network_events')}
                />
                <FeatureCard
                    icon={<MessageSquare className="w-8 h-8 text-primary dark:text-secondary" />}
                    title={t('incubation.community_forum_label')}
                    description={t('incubation.community.communityForum.desc')}
                    buttonText={t('incubation.community.communityForum.button')}
                    onClick={() => setActiveModule('network_forum')}
                />
            </div>
        </div>
    );
};

export default IncubationCommunityPage;