import React from 'react';
import type { LeadershipData, Unit, Event } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import TeamMemberCard from './TeamMemberCard';
import EventCard from './EventCard';
import MetricsDashboard from './MetricsDashboard';
import QuranicTimeline from './QuranicTimeline';

interface LeadershipPlanViewProps {
  unit: Unit;
  leadershipData: LeadershipData;
  dispatch: React.Dispatch<any>;
  onEventClick: (event: Event) => void;
}

const LeadershipPlanView: React.FC<LeadershipPlanViewProps> = ({ unit, leadershipData, dispatch, onEventClick }) => {
  const { t } = useLocalization();

  // Define canonical stage order
  const stageOrder: { id: 's2' | 's1' | 's3'; key: 'firstSemester' | 'secondSemester' | 'summerBreak' }[] = [
    { id: 's2', key: 'firstSemester' },
    { id: 's1', key: 'secondSemester' },
    { id: 's3', key: 'summerBreak' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
        <MetricsDashboard unit={unit} />
        
        {/* Work Team Section - Displayed Once */}
        <div className="bg-sky-50 dark:bg-sky-900/20 p-6 rounded-2xl my-8 border border-sky-200 dark:border-sky-800/50">
           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 rtl:flex-row-reverse text-foreground dark:text-dark-foreground">
              👥 {t('leadership.workTeam')}
           </h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {unit.team.map(member => (
               <TeamMemberCard key={member.id} member={member} />
             ))}
           </div>
        </div>
        
        <div className="space-y-12">
          {stageOrder.map(({ id, key }) => {
            const stageData = unit.stages.find(s => s.id === id);
            if (!stageData) return null;

            return (
              <section key={id}>
                {/* Stage Header */}
                <div className="flex items-center justify-center mb-4">
                   <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
                   <h2 className="text-2xl font-semibold whitespace-nowrap px-4 text-foreground dark:text-dark-foreground">{t(`leadership.stages.${id}`)}</h2>
                   <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
                </div>

                {/* Quranic Timeline - Conditional Display */}
                {unit.id === 'educational' && (
                  <QuranicTimeline 
                    stations={leadershipData.quranicTimeline[key]}
                    stageKey={key}
                    stageTitle={t(`leadership.stages.${id}`)}
                    dispatch={dispatch}
                  />
                )}

                {/* Events Grid */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground dark:text-dark-foreground">{t('leadership.workPlan')}</h3>
                   {stageData.events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {stageData.events.map(event => (
                            <EventCard key={event.id} event={event} dispatch={dispatch} onClick={() => onEventClick(event)} />
                          ))}
                      </div>
                   ) : (
                      <div className="text-center py-8 px-4 bg-card/50 dark:bg-dark-card/50 rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">{t('leadership.noEventsPlanned')}</p>
                      </div>
                   )}
                </div>
              </section>
            );
          })}
        </div>
    </div>
  );
};

export default LeadershipPlanView;