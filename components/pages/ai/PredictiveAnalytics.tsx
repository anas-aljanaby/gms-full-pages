import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import AiCard from './AiCard';
import { AnomalyIcon } from '../../icons/AiIcons';
import { SparklesIcon } from '../../icons/GenericIcons';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatCurrency } from '../../../lib/utils';
import { MONTHLY_DONATIONS_DATA } from '../../../data/mockData';

const PredictiveAnalytics = () => {
    const { t, language } = useLocalization();
    const forecastData = [
        { name: 'Jul', donations: 7000 },
        { name: 'Aug', forecast: 6800 },
        { name: 'Sep', forecast: 7200 },
        { name: 'Oct', forecast: 7500 },
    ];
    
    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.predictive_analytics.forecastTitle')} icon={<AnomalyIcon className="w-6 h-6" />}>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                            <XAxis dataKey="name" data={forecastData} />
                            <YAxis tickFormatter={(val) => formatCurrency(val as number, language)} />
                            <Tooltip formatter={(val) => formatCurrency(val as number, language)} />
                            <Line type="monotone" dataKey="donations" data={MONTHLY_DONATIONS_DATA} stroke="hsl(210, 40%, 50%)" strokeWidth={2} />
                            <Line type="monotone" dataKey="forecast" data={forecastData} stroke="hsl(145, 63%, 49%)" strokeWidth={2} strokeDasharray="5 5" />
                            <ReferenceDot x="Feb" y={3000} r={5} fill="red" stroke="none" ifOverflow="extendDomain" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </AiCard>
            <AiCard title={t('ai_automation.predictive_analytics.analysisTitle')} icon={<SparklesIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span>{t('ai_automation.predictive_analytics.anomalyTitle')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 pl-5 mt-1" dangerouslySetInnerHTML={{ __html: t('ai_automation.predictive_analytics.anomalyText') }} />
                    </div>
                     <div>
                        <h4 className="font-bold flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span>{t('ai_automation.predictive_analytics.forecastRecommendationTitle')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 pl-5 mt-1" dangerouslySetInnerHTML={{ __html: t('ai_automation.predictive_analytics.forecastRecommendationText') }} />
                    </div>
                </div>
            </AiCard>
        </div>
    );
};

export default PredictiveAnalytics;
