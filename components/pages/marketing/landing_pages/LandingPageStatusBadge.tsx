import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { LandingPageStatus } from '../../../../types';

interface LandingPageStatusBadgeProps {
    status: LandingPageStatus;
}

const LandingPageStatusBadge: React.FC<LandingPageStatusBadgeProps> = ({ status }) => {
    const { t } = useLocalization();

    const config: Record<LandingPageStatus, { color: string; dot: string }> = {
        Published: { color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', dot: 'bg-green-500' },
        Draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', dot: 'bg-yellow-500' },
        Scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', dot: 'bg-blue-500' },
        Archived: { color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
    };

    const { color, dot } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`}></span>
            {t(`digital_marketing.website_pages.statuses.${status}`)}
        </span>
    );
};

export default LandingPageStatusBadge;
