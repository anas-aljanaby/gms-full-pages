
import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { AdCampaignStatus } from '../../../../types';
import {
    PlayIcon,
    PauseIcon,
    ClockIcon,
    CheckCircleIcon,
    LearningIcon,
    ReviewIcon,
    RejectedIcon
} from '../../../icons/MarketingIcons';
import Spinner from '../../../common/Spinner';

interface AdCampaignStatusBadgeProps {
    status: AdCampaignStatus;
}

const AdCampaignStatusBadge: React.FC<AdCampaignStatusBadgeProps> = ({ status }) => {
    const { t } = useLocalization();

    // FIX: Corrected import to CampaignStatus and added Scheduled status to config.
    const config: Record<AdCampaignStatus, { icon: React.FC; color: string }> = {
        'Active': { icon: PlayIcon, color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        'Paused': { icon: PauseIcon, color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        'Scheduled': { icon: ClockIcon, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        'Ended': { icon: CheckCircleIcon, color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
        'Learning': { icon: LearningIcon, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        'In Review': { icon: ReviewIcon, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
        'Rejected': { icon: RejectedIcon, color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };

    const { icon: Icon, color } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            <Icon />
            {t(`digital_marketing.advertising.active_campaigns.statuses.${status.replace(' ', '_')}`)}
        </span>
    );
};

export default AdCampaignStatusBadge;
