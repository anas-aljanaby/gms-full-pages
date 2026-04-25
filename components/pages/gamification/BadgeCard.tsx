import React from 'react';
import { motion } from 'framer-motion';
import type { Badge } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatDate } from '../../../lib/utils';

interface BadgeCardProps {
    badge: Badge;
    status: 'earned' | 'in-progress' | 'locked';
    progress: number;
    dateEarned: string | null;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, status, progress, dateEarned }) => {
    const { t, language } = useLocalization();
    const isLocked = status === 'locked';
    const isInProgress = status === 'in-progress';
    const isEarned = status === 'earned';

    const progressPercent = badge.total > 0 ? (progress / badge.total) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border-2 
                ${isLocked ? 'border-dashed border-gray-300 dark:border-slate-700' : 'border-transparent'}
                ${isEarned ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-slate-800 dark:to-slate-900 shadow-lg' : ''}
            `}
        >
            <div className={`relative w-24 h-24 flex items-center justify-center rounded-full transition-all duration-300 ${isEarned ? 'bg-yellow-400/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
                {isEarned && <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-30 animate-pulse-glow"/>}
                <span 
                    className="text-5xl transition-transform duration-300"
                    style={{ filter: isLocked ? 'grayscale(100%)' : 'none', opacity: isLocked ? 0.5 : 1 }}
                >
                    {badge.icon}
                </span>
            </div>

            <h3 className="mt-3 font-bold text-lg text-foreground dark:text-dark-foreground">{badge.name[language]}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex-grow min-h-[3.5rem] flex items-center">
                {isEarned ? badge.description[language] : badge.criteria[language]}
            </p>
            
            {isEarned && dateEarned && (
                <p className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                    {t('gamification.badges.earnedOn')}: {formatDate(dateEarned, language)}
                </p>
            )}

            {isInProgress && (
                <div className="w-full mt-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>{t('gamification.badges.progress')}</span>
                        <span>{progress}/{badge.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-slate-700">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default BadgeCard;