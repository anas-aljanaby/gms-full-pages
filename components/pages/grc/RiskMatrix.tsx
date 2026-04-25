import React, { useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { GrcRisk } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';

interface RiskMatrixProps {
    risks: GrcRisk[];
    onCellClick: (filter: { impact: number, probability: number } | null) => void;
    activeCell: { impact: number, probability: number } | null;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, onCellClick, activeCell }) => {
    const { t } = useLocalization();
    const { theme } = useTheme();

    const matrix = useMemo(() => {
        const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
        risks.forEach(risk => {
            const impactIndex = risk.impact - 1; // 0-4
            const probIndex = risk.probability - 1; // 0-4
            if (grid[impactIndex] && grid[impactIndex][probIndex] !== undefined) {
                grid[impactIndex][probIndex]++;
            }
        });
        return grid;
    }, [risks]);

    const getRiskScoreColor = (score: number): { bg: string; text: string } => {
        const minScore = 1;
        const maxScore = 25;
        const startHue = 120; // Green
        const endHue = 5;   // Red

        // Normalize score to a 0-1 range
        const percentage = (score - minScore) / (maxScore - minScore);

        // Interpolate hue from green to red
        const hue = startHue - (startHue - endHue) * percentage;
        
        const saturation = '90%';
        const lightness = theme === 'dark' ? '45%' : '55%';
        const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

        return {
            bg: `hsl(${hue}, ${saturation}, ${lightness})`,
            text: textColor,
        };
    };

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50">
            <h3 className="font-bold text-lg mb-2 text-center text-foreground dark:text-dark-foreground">{t('grc.dashboard.riskMatrix')}</h3>
            <div className="flex">
                <div className="flex items-center justify-center pr-1 rtl:pr-0 rtl:pl-1">
                    <div className="transform -rotate-90 whitespace-nowrap font-bold text-sm text-gray-600 dark:text-gray-400">
                        {t('projects.risks.impact')}
                    </div>
                </div>

                <div className="flex-grow">
                    <div className="flex">
                        <div className="grid grid-rows-5 text-xs font-bold text-gray-500 dark:text-gray-400 w-6 flex-shrink-0">
                            {[5,4,3,2,1].map(level => (
                                <div key={level} className="flex items-center justify-center">
                                    {level}
                                </div>
                            ))}
                        </div>

                        <div className="flex-grow grid grid-cols-5 grid-rows-5 gap-1 aspect-square">
                            {matrix.slice().reverse().map((row, i) =>
                                row.map((count, j) => {
                                    const impact = 5 - i;
                                    const probability = j + 1;
                                    const score = impact * probability;
                                    const { bg, text } = getRiskScoreColor(score);
                                    const isActive = activeCell?.impact === impact && activeCell?.probability === probability;
                                    return (
                                    <button
                                        key={`${i}-${j}`}
                                        onClick={() => onCellClick({ impact, probability })}
                                        className={`flex items-center justify-center rounded-sm transition-all ${isActive ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: bg }}
                                        title={`${count} risks`}
                                    >
                                        {count > 0 && <span className={`font-bold text-lg ${text}`}>{count}</span>}
                                    </button>
                                )})
                            )}
                        </div>
                    </div>
                    
                    <div className="ml-6 rtl:ml-0 rtl:mr-6">
                        <div className="grid grid-cols-5 text-center text-xs font-bold mt-1 text-gray-500 dark:text-gray-400">
                            {[1,2,3,4,5].map(level => <span key={level}>{level}</span>)}
                        </div>
                        <div className="text-center font-bold text-sm mt-1 text-gray-600 dark:text-gray-400">
                            {t('projects.risks.probability')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskMatrix;