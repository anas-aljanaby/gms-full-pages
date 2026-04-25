
import React from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { useCountUp } from '../../../../hooks/useCountUp';
import { formatNumber, formatCurrency } from '../../../../lib/utils';
import type { LandingPageKpi } from '../../../../types';

interface LandingPageKpiCardProps {
    kpi: LandingPageKpi[keyof LandingPageKpi];
}

const LandingPageKpiCard: React.FC<LandingPageKpiCardProps> = ({ kpi }) => {
    const { t, language } = useLocalization();

    const getTitle = () => {
        if ('breakdown' in kpi) return t('digital_marketing.website_pages.kpi.totalPages');
        if ('unique' in kpi) return t('digital_marketing.website_pages.kpi.totalViews');
        if ('topPerformer' in kpi) return t('digital_marketing.website_pages.kpi.avgConversionRate');
        if ('revenue' in kpi) return t('digital_marketing.website_pages.kpi.totalConversions');
        return '';
    };

    const animatedValue = useCountUp('value' in kpi ? kpi.value : 0, 1500);

    const renderValue = () => {
        if ('unique' in kpi) return formatNumber(Math.round(animatedValue), language);
        if ('topPerformer' in kpi) return `${animatedValue.toFixed(1)}%`;
        if ('revenue' in kpi) return formatNumber(Math.round(animatedValue), language);
        return formatNumber(Math.round(animatedValue), language);
    };

    const renderSubtext = () => {
        // FIX: Use 'in' operator as a type guard to safely access properties on the union type.
        if ('breakdown' in kpi) {
            return `${kpi.breakdown.published} ${t('digital_marketing.website_pages.kpi.published')}`;
        }
        // FIX: Use 'in' operator as a type guard to safely access properties on the union type.
        if ('trend' in kpi && 'unique' in kpi) {
            const isPositive = kpi.trend >= 0;
            return <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{isPositive ? '▲' : '▼'} {kpi.trend}% vs last month</span>;
        }
        // FIX: Use 'in' operator as a type guard to safely access properties on the union type.
        if ('topPerformer' in kpi) {
            return `Top: ${kpi.topPerformer.value}% (${kpi.topPerformer.name})`;
        }
        // FIX: Use 'in' operator as a type guard to safely access properties on the union type.
        if ('revenue' in kpi) {
            return `~ ${formatCurrency(kpi.revenue, language)}`;
        }
        return null;
    };

    return (
        <div className="bg-card dark:bg-dark-card p-5 rounded-2xl shadow-soft">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">{getTitle()}</h3>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground mt-2">
                {renderValue()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{renderSubtext()}</p>
        </div>
    );
};

export default LandingPageKpiCard;
