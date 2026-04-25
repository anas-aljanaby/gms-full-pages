
import React, { useState, useMemo } from 'react';
import type { QuranicStation } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber } from '../../../lib/utils';
import { CheckIcon, HalfCircleIcon, CircleIcon } from '../../icons/QuranicTimelineIcons';

interface QuranicTimelineProps {
  stations: QuranicStation[];
  stageKey: 'secondSemester' | 'firstSemester' | 'summerBreak';
  stageTitle: string;
  dispatch: React.Dispatch<any>;
}

const QuranicTimeline: React.FC<QuranicTimelineProps> = ({ stations, stageKey, stageTitle, dispatch }) => {
  const { t, language, dir } = useLocalization();
  const [hoveredStation, setHoveredStation] = useState<QuranicStation | null>(null);
  const [modalStation, setModalStation] = useState<QuranicStation | null>(null);

  const stats = useMemo(() => {
    const completed = stations.filter(s => s.status === 'completed').length;
    const inProgress = stations.filter(s => s.status === 'in-progress').length;
    const upcoming = stations.filter(s => s.status === 'upcoming').length;
    const total = stations.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { completed, inProgress, upcoming, total, progress };
  }, [stations]);

  const handleMarkAsComplete = (station: QuranicStation) => {
    dispatch({
        type: 'UPDATE_QURANIC_STATION_STATUS',
        payload: { stageKey, week: station.week, newStatus: 'completed' },
    });
    setModalStation(null);
  }

  const getStatusInfo = (station: QuranicStation) => {
    switch (station.status) {
      case 'completed': return {
        color: 'bg-gradient-to-br from-green-500 to-emerald-600',
        icon: <CheckIcon />,
        line: 'bg-green-500',
      };
      case 'in-progress': return {
        color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
        icon: <HalfCircleIcon />,
        line: 'bg-yellow-500',
      };
      default: return {
        color: 'bg-slate-300 dark:bg-slate-600',
        icon: <CircleIcon />,
        line: 'bg-slate-300 dark:bg-slate-600',
      };
    }
  };

  return (
    <div className="bg-card dark:bg-dark-card/50 rounded-2xl p-4 sm:p-6 my-8 shadow-soft border border-gray-200 dark:border-slate-700/50">
      <h3 className="text-xl font-bold mb-4 text-foreground dark:text-dark-foreground flex items-center gap-2 rtl:flex-row-reverse"><span>📖</span> <span>{t('leadership.quranicTimeline.title')} - {stageTitle}</span></h3>
      
      {/* Timeline Track */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-center min-w-max px-2">
          {stations.map((station, index) => {
            const { color, icon, line } = getStatusInfo(station);
            const isCurrent = station.isCurrent;
            const size = isCurrent ? 'w-14 h-14' : 'w-12 h-12';
            const pulseAnimation = isCurrent ? 'animate-pulse' : '';

            return (
              <React.Fragment key={station.week}>
                {index > 0 && <div className={`h-2 flex-1 ${line}`}></div>}
                <div 
                    className="relative"
                    onMouseEnter={() => setHoveredStation(station)}
                    onMouseLeave={() => setHoveredStation(null)}
                    onClick={() => setModalStation(station)}
                >
                  <div className={`relative z-10 flex flex-col items-center justify-center ${size} rounded-full ${color} text-white font-bold cursor-pointer transition-all duration-300 hover:scale-110 ${pulseAnimation} shadow-lg`}>
                    {icon}
                    <span className="absolute -bottom-5 text-xs text-gray-500 dark:text-gray-400 font-semibold">{formatNumber(station.week, language)}</span>
                  </div>
                  {/* Tooltip */}
                  {hoveredStation?.week === station.week && (
                     <div className={`absolute bottom-full mb-3 w-48 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-20 transition-opacity duration-300`}>
                        <p className="font-bold border-b border-slate-600 pb-1 mb-1">{t('leadership.quranicTimeline.week')} {formatNumber(station.week, language)}</p>
                        <p><span className="font-semibold">{t('leadership.quranicTimeline.dateRange')}:</span> {station.dateRange[language]}</p>
                        <p><span className="font-semibold">{t('leadership.quranicTimeline.content')}:</span> {station.content[language]}</p>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress Bar & Stats */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('leadership.quranicTimeline.progress')}</span>
            <span className="text-sm font-bold text-primary dark:text-secondary">{Math.round(stats.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full" style={{ width: `${stats.progress}%` }}></div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>🟢 {t('leadership.quranicTimeline.completed')}: {formatNumber(stats.completed, language)}</span>
            <span>🟡 {t('leadership.quranicTimeline.inProgress')}: {formatNumber(stats.inProgress, language)}</span>
            <span>⚪ {t('leadership.quranicTimeline.upcoming')}: {formatNumber(stats.upcoming, language)}</span>
            <span className="hidden sm:inline">|</span>
            <span>{t('leadership.quranicTimeline.totalDuration')}: {formatNumber(stats.total, language)} {t('leadership.quranicTimeline.weeks')}</span>
        </div>
      </div>
      
      {/* Modal */}
      {modalStation && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setModalStation(null)}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md m-4 p-6" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-2xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t('leadership.quranicTimeline.stationDetails')}</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-semibold text-gray-500">{t('leadership.quranicTimeline.week')}:</span> <span className="font-bold">{formatNumber(modalStation.week, language)}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-500">{t('leadership.quranicTimeline.dateRange')}:</span> <span>{modalStation.dateRange[language]}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-500">{t('leadership.quranicTimeline.content')}:</span> <span>{modalStation.content[language]}</span></div>
                     <div className="flex justify-between"><span className="font-semibold text-gray-500">{t('leadership.quranicTimeline.status')}:</span> <span>{t(`leadership.quranicTimeline.${modalStation.status.replace('-', '')}`)}</span></div>
                    <div className="pt-2">
                        <label className="font-semibold text-gray-500 block mb-1">{t('leadership.quranicTimeline.notes')}:</label>
                        <textarea className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700" rows={3} placeholder="...Add notes here"></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                     <button onClick={() => setModalStation(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.close')}</button>
                    {modalStation.status !== 'completed' && (
                        <button onClick={() => handleMarkAsComplete(modalStation)} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600">
                          {t('leadership.quranicTimeline.markAsComplete')}
                        </button>
                    )}
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default QuranicTimeline;
