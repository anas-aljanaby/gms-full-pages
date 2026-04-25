

import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { GrcData, GrcRisk, GrcRiskLevel, RiskLevel } from '../../../types';
import { FileText, ListChecks, Scale, Siren, Flame, ThumbsDown } from 'lucide-react';
import AiCard from '../ai/AiCard';

interface KpiCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => (
    <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft flex items-center gap-4 border border-gray-200 dark:border-slate-700/50">
        <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
        </div>
    </div>
);

const RiskMatrix: React.FC<{ risks: GrcRisk[] }> = ({ risks }) => {
    const { t } = useLocalization();
    // FIX: Add mapping from number to RiskLevel string to handle numeric risk data.
    const numToRiskLevel: Record<number, RiskLevel> = {
        1: 'low',
        2: 'low',
        3: 'medium',
        4: 'high',
        5: 'high',
    };
    const levelMap: Record<RiskLevel, number> = { 'low': 0, 'medium': 1, 'high': 2 };

    const matrix: (GrcRisk[])[][] = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => []));
    risks.forEach(risk => {
        const impactLevel = numToRiskLevel[risk.impact as number] || 'low';
        const probLevel = numToRiskLevel[risk.probability as number] || 'low';
        const impactIndex = levelMap[impactLevel];
        const probIndex = levelMap[probLevel];
        if (matrix[impactIndex] && matrix[impactIndex][probIndex] !== undefined) {
            matrix[impactIndex][probIndex].push(risk);
        }
    });

    const matrixColors = [
        ['bg-green-100 dark:bg-green-900/40', 'bg-yellow-100 dark:bg-yellow-900/40', 'bg-orange-100 dark:bg-orange-900/40'],
        ['bg-yellow-100 dark:bg-yellow-900/40', 'bg-orange-100 dark:bg-orange-900/40', 'bg-red-100 dark:bg-red-900/40'],
        ['bg-orange-100 dark:bg-orange-900/40', 'bg-red-100 dark:bg-red-900/40', 'bg-red-200 dark:bg-red-900/60'],
    ];
    
    return (
        <div>
            <h4 className="font-bold text-center mb-2">{t('grc.dashboard.riskMatrix')}</h4>
            <div className="flex">
                <div className="flex flex-col-reverse justify-around text-xs font-bold -mr-2 items-center">
                    {(['low', 'medium', 'high'] as RiskLevel[]).map(level => <div key={level} className="transform -rotate-90 ">{t(`projects.risks.levels.${level}`)}</div>)}
                    <div className="transform -rotate-90 font-bold text-sm text-gray-600 dark:text-gray-400">{t('projects.risks.impact')}</div>
                </div>
                <div className="flex-grow">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 aspect-square border-2 dark:border-slate-600 p-1 rounded-md">
                        {matrix.slice().reverse().map((row, i) =>
                            row.map((cell, j) => (
                                <div key={`${2-i}-${j}`} className={`flex items-center justify-center p-1 rounded-sm ${matrixColors[2-i][j]}`}>
                                    {cell?.length > 0 && <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{cell.length}</span>}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="grid grid-cols-3 text-center text-xs font-bold mt-1">
                        {(['low', 'medium', 'high'] as RiskLevel[]).map(level => <span key={level}>{t(`projects.risks.levels.${level}`)}</span>)}
                    </div>
                     <div className="text-center font-bold text-sm mt-1 text-gray-600 dark:text-gray-400">{t('projects.risks.probability')}</div>
                </div>
            </div>
        </div>
    );
};

const GrcDashboard: React.FC<{ grcData: GrcData }> = ({ grcData }) => {
    const { t } = useLocalization();

    const stats = {
        activePolicies: grcData.policies.filter(p => p.status === 'active').length,
        activeRisks: grcData.risks.filter(r => (r as any).status !== 'closed').length,
        highRisks: grcData.risks.filter(r => r.level === 'High' || r.level === 'Critical').length,
        nonCompliant: grcData.assessments.filter(a => a.status === 'non-compliant').length,
        pendingDecisions: grcData.decisions.filter(d => d.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KpiCard title={t('grc.dashboard.pendingDecisions')} value={stats.pendingDecisions} icon={<Scale />} />
                <KpiCard title={t('grc.dashboard.nonCompliant')} value={stats.nonCompliant} icon={<ThumbsDown />} />
                <KpiCard title={t('grc.dashboard.highRisks')} value={stats.highRisks} icon={<Siren className="text-red-500"/>} />
                <KpiCard title={t('grc.dashboard.activeRisks')} value={stats.activeRisks} icon={<Flame />} />
                <KpiCard title={t('grc.dashboard.activePolicies')} value={stats.activePolicies} icon={<FileText />} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AiCard title={t('grc.dashboard.recentActivity')}>
                        <div className="h-64 flex items-center justify-center text-gray-400">
                           {t('grc.dashboard.underConstruction')}
                        </div>
                    </AiCard>
                </div>
                <div className="lg:col-span-1">
                    <AiCard title="">
                        <RiskMatrix risks={grcData.risks} />
                    </AiCard>
                </div>
            </div>
        </div>
    );
};

export default GrcDashboard;