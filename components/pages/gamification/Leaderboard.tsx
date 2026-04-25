import React from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardUser } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber } from '../../../lib/utils';
import { BronzeIcon, SilverIcon, GoldIcon, PlatinumIcon } from '../../icons/GamificationIcons';

interface LeaderboardProps {
    leaderboard: LeaderboardUser[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => {
    const { t, language } = useLocalization();
    const top5 = leaderboard.slice(0, 5);

    const rankIcons = ['🥇', '🥈', '🥉'];

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50">
            <h3 className="text-lg font-bold p-4 border-b dark:border-slate-700">{t('gamification.leaderboard.title')}</h3>
            <ul className="p-4 space-y-3">
                {top5.map((user, index) => (
                    <motion.li
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <span className="font-bold w-6 text-center text-lg">{rankIcons[index] || index + 1}</span>
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" loading="lazy" />
                        <div className="flex-grow">
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">{formatNumber(user.points, language)} {t('gamification.points')}</p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;