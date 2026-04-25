import React, { useState } from 'react';
import type { GamificationData, BadgeCategory } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import BadgeCard from './BadgeCard';

interface BadgesGalleryProps {
    allBadges: GamificationData['allBadges'];
    userAchievement: GamificationData['userAchievement'];
}

const BadgesGallery: React.FC<BadgesGalleryProps> = ({ allBadges, userAchievement }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<BadgeCategory>('Attendance');
    
    const categories: BadgeCategory[] = ['Attendance', 'Participation', 'Evaluation', 'Achievement'];
    
    const getTabClass = (tabId: BadgeCategory) => {
        return activeTab === tabId
          ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300';
    };

    const filteredBadges = allBadges.filter(b => b.category === activeTab);

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border dark:border-slate-700/50">
            <div className="p-4 border-b dark:border-slate-700">
                <h2 className="text-xl font-bold">{t('gamification.badges.title')}</h2>
                 <div className="mt-2 border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${getTabClass(cat)}`}
                            >
                                {t(`gamification.badges.categories.${cat}`)}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBadges.map(badge => {
                        const earned = userAchievement.earnedBadges.find(b => b.badgeId === badge.id);
                        const progress = userAchievement.badgeProgress[badge.id];
                        
                        let status: 'earned' | 'in-progress' | 'locked' = 'locked';
                        if (earned) status = 'earned';
                        else if (progress > 0) status = 'in-progress';
                        
                        return (
                             <BadgeCard
                                key={badge.id}
                                badge={badge}
                                status={status}
                                progress={progress || 0}
                                dateEarned={earned?.dateEarned || null}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default BadgesGallery;