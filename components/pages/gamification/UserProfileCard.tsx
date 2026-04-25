import React from 'react';
import { motion } from 'framer-motion';
import type { UserAchievement, UserLevel } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber } from '../../../lib/utils';
import { BronzeIcon, SilverIcon, GoldIcon, PlatinumIcon } from '../../icons/GamificationIcons';

interface UserProfileCardProps {
  userAchievement: UserAchievement;
}

const levelConfig: Record<UserLevel, { icon: React.FC; color: string; nextLevelPoints: number }> = {
    Bronze: { icon: BronzeIcon, color: 'text-[#cd7f32]', nextLevelPoints: 200 },
    Silver: { icon: SilverIcon, color: 'text-gray-400', nextLevelPoints: 500 },
    Gold: { icon: GoldIcon, color: 'text-yellow-500', nextLevelPoints: 1000 },
    Platinum: { icon: PlatinumIcon, color: 'text-cyan-400', nextLevelPoints: Infinity },
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userAchievement }) => {
    const { t, language } = useLocalization();
    const animatedPoints = useCountUp(userAchievement.totalPoints);
    const { icon: LevelIcon, color, nextLevelPoints } = levelConfig[userAchievement.level];
    
    const pointsForCurrentLevel = userAchievement.level === 'Bronze' ? 0 : levelConfig[Object.keys(levelConfig)[Object.keys(levelConfig).indexOf(userAchievement.level) - 1] as UserLevel].nextLevelPoints;
    const progressToNextLevel = nextLevelPoints === Infinity ? 100 : ((userAchievement.totalPoints - pointsForCurrentLevel) / (nextLevelPoints - pointsForCurrentLevel)) * 100;


    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50 p-6 text-center">
            <img 
                src="https://picsum.photos/id/401/100/100" 
                alt="User Avatar"
                className="w-24 h-24 rounded-full mx-auto border-4 border-primary-light dark:border-primary/20 shadow-lg"
                loading="lazy"
            />
            <h2 className="mt-4 text-xl font-bold">Ali Veli</h2>
            
            <div className="mt-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-500">{t('gamification.totalPoints')}</p>
                <p className="text-5xl font-extrabold text-primary dark:text-secondary">{formatNumber(animatedPoints, language)}</p>
            </div>

            <div className="mt-4">
                 <div className="flex items-center justify-center gap-2">
                    <LevelIcon />
                    <h3 className={`text-xl font-bold ${color}`}>{userAchievement.level}</h3>
                </div>
                {nextLevelPoints !== Infinity && (
                    <div className="mt-2">
                         <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>{formatNumber(userAchievement.totalPoints, language)}</span>
                            <span>{formatNumber(nextLevelPoints, language)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-slate-700">
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full" style={{ width: `${progressToNextLevel}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('gamification.nextLevel')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileCard;