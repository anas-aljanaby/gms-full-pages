import React from 'react';
import { motion } from 'framer-motion';
import type { GamificationData, Badge } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { TrophyIcon } from '../icons/ModuleIcons';
import UserProfileCard from './gamification/UserProfileCard';
import BadgesGallery from './gamification/BadgesGallery';
import Leaderboard from './gamification/Leaderboard';
import { useToast } from '../../hooks/useToast';

interface GamificationPageProps {
    gamificationData: GamificationData;
    earnBadge: (badgeId: string) => Badge | null;
}

const GamificationPage: React.FC<GamificationPageProps> = ({ gamificationData, earnBadge }) => {
    const { t } = useLocalization();
    const { showSuccess } = useToast();

    const handleSimulateEarn = () => {
        let badgeToEarnId: string | undefined;

        // Find a badge that is in progress to simulate completing it
        const inProgressBadgeId = Object.keys(gamificationData.userAchievement.badgeProgress)[0];
        if (inProgressBadgeId) {
            badgeToEarnId = inProgressBadgeId;
        } else {
            // Find any locked badge to earn
            const lockedBadge = gamificationData.allBadges.find(b => 
                !gamificationData.userAchievement.earnedBadges.some(eb => eb.badgeId === b.id)
            );
            if (lockedBadge) {
                badgeToEarnId = lockedBadge.id;
            }
        }

        if (badgeToEarnId) {
            const earnedBadge = earnBadge(badgeToEarnId);
            if (earnedBadge) {
                showSuccess(`You've earned the "${earnedBadge.name.en}" badge.`, { title: `Badge Unlocked!` });
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                 <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <TrophyIcon /> {t('sidebar.gamification')}
                </h1>
                <button
                    onClick={handleSimulateEarn}
                    className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors"
                >
                    {t('gamification.simulateEarn')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-4 xl:col-span-3 space-y-6"
                >
                    <UserProfileCard userAchievement={gamificationData.userAchievement} />
                    <Leaderboard leaderboard={gamificationData.leaderboard} />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-8 xl:col-span-9"
                >
                    <BadgesGallery 
                        allBadges={gamificationData.allBadges} 
                        userAchievement={gamificationData.userAchievement}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default GamificationPage;
