import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCountUp } from '../../../hooks/useCountUp';
import { formatNumber } from '../../../lib/utils';

interface CategoryCardProps {
    category: string;
    count: number;
}

const categoryIcons: Record<string, string> = {
  SeasonalDonor: "🎄",
  RecurringDonor: "🔄",
  HeroDonor: "🌟",
  GeneralDonor: "👥",
  DormantDonor: "😴",
  EventDonor: "🎉",
  NewDonor: "✨"
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count }) => {
    const { t, language } = useLocalization();
    const animatedCount = useCountUp(count || 0);
    const categoryKey = category.replace(/ /g, '');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[150px]">
            <span className="text-4xl mb-2">{categoryIcons[categoryKey]}</span>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 h-10 flex items-center text-center">{t(`donorIntelligence.categories.${categoryKey}`)}</h4>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(animatedCount, language)}
            </p>
        </div>
    );
};

export default CategoryCard;