
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { GoogleGenAI, Type } from "@google/genai";
import * as complianceDb from '../../data/compliance';
import type { ComplianceEntity, ComplianceAlert, ComplianceEntityType, RiskLevel, AlertStatus } from '../../types';
import { ComplianceIcon } from '../icons/ModuleIcons';
import { TotalScannedIcon, HighRiskIcon, OpenAlertsIcon } from '../icons/ComplianceIcons';
import { formatDate, formatNumber } from '../../lib/utils';
import { PlusCircleIcon } from '../icons/GenericIcons';
import Spinner from '../common/Spinner';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
    const { language } = useLocalization();
    return (
        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft flex items-center space-x-4 rtl:space-x-reverse">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-foreground dark:text-dark-foreground">{formatNumber(value, language)}</p>
        </div>
        </div>
    );
};

const CompliancePage: React.FC = () => {
    const { t, language } = useLocalization();
    const toast = useToast();
    const [stats, setStats] = useState(complianceDb.getStats());
    const [entities, setEntities] = useState<ComplianceEntity[]>(complianceDb.getEntities());
    const [alerts, setAlerts] = useState<ComplianceAlert[]>(complianceDb.getAlerts());
    const [name, setName] = useState('');
    const [type, setType] = useState<ComplianceEntityType>('individual');
    const [country, setCountry] = useState('');
    const [isScreening, setIsScreening] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const refreshState = () => {
        setStats(complianceDb.getStats());
        setEntities(complianceDb.getEntities());
        setAlerts(complianceDb.getAlerts());
    }

    const handleScreenEntity = async () => {
        if (!name.trim() || !country.trim()) {
            toast.showWarning(t('compliance.toasts.missingInfoMessage'), {title: t('compliance.toasts.missingInfoTitle')});
            return;
        }
        setIsScreening(true);
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are a compliance screening AI. You will be given an entity's name, type, and country. You must assess the potential risk by pretending to check it against international sanctions lists (like OFAC, UN, EU), adverse media, and PEP (Politically Exposed Person) lists.

Your response MUST be a JSON object with the following structure:
- 'risk_score': An integer from 0 to 100 representing the calculated risk.
- 'risk_level': A string, either 'low', 'medium', or 'high'.
- 'recommendation': A string, either 'approve', 'review', or 'reject'.
- 'reasoning_en': A concise explanation in English for the assigned risk level and recommendation.
- 'reasoning_ar': The same explanation translated into Arabic.
- 'reasoning_tr': The same explanation translated into Turkish.
- 'matchDetails': A string containing specific (but simulated) details of any matches found, or null if no matches.

Rules for risk levels:
- 'low': No matches found. Risk score 0-39. Recommendation 'approve'.
- 'medium': Name has a partial, common, or ambiguous match (e.g., common name on a list). Risk score 40-69. Recommendation 'review'.
- 'high': Name has a strong or direct match on a significant list (e.g., sanctions). Risk score 70-100. Recommendation 'reject'.

Respond ONLY with the JSON object.`;

            const userPrompt = JSON.stringify({ name, type, country });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            risk_score: { type: Type.NUMBER },
                            risk_level: { type: Type.STRING },
                            recommendation: { type: Type.STRING },
                            reasoning_en: { type: Type.STRING },
                            reasoning_ar: { type: Type.STRING },
                            reasoning_tr: { type: Type.STRING },
                            matchDetails: { type: Type.STRING, nullable: true },
                        },
                        required: ['risk_score', 'risk_level', 'recommendation', 'reasoning_en', 'reasoning_ar', 'reasoning_tr']
                    }
                }
            });

            const screeningResult = JSON.parse(response.text.trim());
            setResult(screeningResult);

            const newEntity = complianceDb.saveEntity({
                name,
                type,
                country,
                riskLevel: screeningResult.risk_level as RiskLevel,
                lastScreened: new Date().toISOString(),
            });

            if (screeningResult.risk_level === 'high' || screeningResult.risk_level === 'medium') {
                complianceDb.saveAlert({
                    entityId: newEntity.id,
                    entityName: newEntity.name,
                    matchDetails: screeningResult.matchDetails || screeningResult.reasoning_en,
                    listSource: t('compliance.simulatedWatchlist')
                });
            }
            
            refreshState();
            setName('');
            setCountry('');

        } catch (error) {
            console.error("Screening error:", error);
            toast.showError(t('compliance.toasts.screeningFailedMessage'), { title: t('compliance.toasts.screeningFailedTitle') });
        } finally {
            setIsScreening(false);
        }
    };
    
    const getRiskColor = (level: RiskLevel | string) => {
        switch (level) {
            case 'high': return 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-800 dark:text-red-200';
            case 'medium': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
            case 'low': return 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 text-green-800 dark:text-green-200';
            default: return 'border-gray-300 bg-gray-50';
        }
    };

    const getRiskEmoji = (level: RiskLevel | string) => {
        switch (level) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪️';
        }
    };

    const getRecEmoji = (rec: string) => {
        switch (rec) {
            case 'approve': return '👍';
            case 'review': return '🤔';
            case 'reject': return '👎';
            default: return '❔';
        }
    };

    const RiskBadge: React.FC<{level: RiskLevel}> = ({level}) => {
        const styles = {
            low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[level]}`}>{t(`projects.risks.levels.${level}`)}</span>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <ComplianceIcon /> {t('compliance.title')}
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('compliance.totalEntities')} value={stats.totalEntities} icon={<TotalScannedIcon/>} color="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300" />
                <StatCard title={t('compliance.highRisk')} value={stats.highRisk} icon={<HighRiskIcon/>} color="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300" />
                <StatCard title={t('compliance.openAlerts')} value={stats.openAlerts} icon={<OpenAlertsIcon/>} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="text-lg font-bold mb-4">{t('compliance.screenNew')}</h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm font-medium">{t('compliance.entityName')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                         <div>
                            <label className="text-sm font-medium">{t('compliance.entityType')}</label>
                            <select value={type} onChange={e => setType(e.target.value as ComplianceEntityType)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                                <option value="individual">{t('compliance.types.individual')}</option>
                                <option value="organization">{t('compliance.types.organization')}</option>
                                <option value="vendor">{t('compliance.types.vendor')}</option>
                                <option value="partner">{t('compliance.types.partner')}</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">{t('compliance.country')}</label>
                            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                        <button onClick={handleScreenEntity} disabled={isScreening} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-lg transition-colors disabled:bg-gray-400">
                            {isScreening ? <Spinner /> : <PlusCircleIcon />} {t('compliance.aiScreen')}
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                    <h3 className="text-lg font-bold mb-4">{t('compliance.recentlyScreened')}</h3>
                    <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-2">{t('compliance.headers.name')}</th>
                                    <th className="p-2">{t('compliance.headers.type')}</th>
                                    <th className="p-2">{t('compliance.headers.riskLevel')}</th>
                                    <th className="p-2">{t('compliance.headers.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entities.map(entity => (
                                    <tr key={entity.id} className="border-t dark:border-slate-700">
                                        <td className="p-2 font-semibold text-foreground dark:text-dark-foreground">{entity.name}</td>
                                        <td className="p-2 capitalize text-gray-500 dark:text-gray-400">{t(`compliance.types.${entity.type}`)}</td>
                                        <td className="p-2"><RiskBadge level={entity.riskLevel} /></td>
                                        <td className="p-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(entity.lastScreened, language)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {result && (
              <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700/50 animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-foreground mb-6">
                  📊 {t('compliance.results')}
                </h2>
    
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                    <div className="text-sm font-medium mb-2 opacity-90">{t('compliance.score')}</div>
                    <div className="text-5xl font-bold">{result.risk_score}<span className="text-2xl">/100</span></div>
                  </div>
    
                  <div className={`rounded-2xl p-6 border-2 shadow-lg transform hover:scale-105 transition ${getRiskColor(result.risk_level)}`}>
                    <div className="text-sm font-medium mb-2">{t('compliance.level')}</div>
                    <div className="text-5xl font-bold flex items-center gap-2">
                      {getRiskEmoji(result.risk_level)}
                      <span className="uppercase">{result.risk_level}</span>
                    </div>
                  </div>
    
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                    <div className="text-sm font-medium mb-2 opacity-90">{t('compliance.rec')}</div>
                    <div className="text-5xl font-bold flex items-center gap-2">
                      {getRecEmoji(result.recommendation)}
                      <span className="uppercase">{result.recommendation}</span>
                    </div>
                  </div>
                </div>
    
                <div className={`rounded-2xl p-6 border-2 mb-6 ${getRiskColor(result.risk_level)}`}>
                  <h3 className="font-bold text-lg mb-3">
                    💡 {t('compliance.details')}
                  </h3>
                  <p className="leading-relaxed">
                    {language === 'ar' ? result.reasoning_ar : language === 'en' ? result.reasoning_en : result.reasoning_tr}
                  </p>
                </div>
    
                <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-6 py-4 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="font-medium">
                    {t('compliance.saveSuccess')}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <h3 className="text-lg font-bold mb-4">{t('compliance.activeAlerts')}</h3>
                 <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-2">{t('compliance.headers.entity')}</th>
                                    <th className="p-2">{t('compliance.headers.matchDetails')}</th>
                                    <th className="p-2">{t('compliance.headers.status')}</th>
                                    <th className="p-2">{t('compliance.headers.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.filter(a => a.status === 'open' || a.status === 'in-review').map(alert => (
                                    <tr key={alert.id} className="border-t dark:border-slate-700">
                                        <td className="p-2 font-semibold text-foreground dark:text-dark-foreground">{alert.entityName}</td>
                                        <td className="p-2 text-xs max-w-sm truncate text-gray-500 dark:text-gray-400">{alert.matchDetails}</td>
                                        <td className="p-2 capitalize text-gray-500 dark:text-gray-400">{t(`compliance.alertStatuses.${alert.status.replace(/-/g, '_')}`)}</td>
                                        <td className="p-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(alert.createdAt, language)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>
    );
};

export default CompliancePage;
