import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import type { EmailStatus } from '../../../../types';
import {
    DraftIcon,
    ClockIcon,
    PlayIcon,
    CheckCircleIcon,
    ArchiveIcon,
} from '../../../icons/MarketingIcons';
import Spinner from '../../../common/Spinner';
import { XCircleIcon } from '../../../icons/UtilityIcons';


interface EmailStatusBadgeProps {
    status: EmailStatus;
}

const EmailStatusBadge: React.FC<EmailStatusBadgeProps> = ({ status }) => {
    const { t } = useLocalization();

    const statusConfig: Record<EmailStatus, { icon: React.FC; color: string }> = {
        Draft: { icon: DraftIcon, color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        Scheduled: { icon: ClockIcon, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        Sending: { icon: () => <Spinner size="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        Sent: { icon: CheckCircleIcon, color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        Failed: { icon: () => <XCircleIcon className="w-4 h-4" />, color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
        Archived: { icon: ArchiveIcon, color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
    };

    const { icon: Icon, color } = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}>
            <Icon />
            {t(`digital_marketing.email.statuses.${status}`)}
        </span>
    );
};

export default EmailStatusBadge;
