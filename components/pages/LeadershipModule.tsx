
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useLeadershipData } from '../../hooks/useLeadershipData';
import type { Event } from '../../types';
import LeadershipPlanView from './leadership/LeadershipPlanView';
import StudentProjectsView from './leadership/StudentProjectsView';
import LeadershipCalendarView from './leadership/LeadershipCalendarView';
import LeadershipOverview from './leadership/LeadershipOverview';
import EventPage from './leadership/EventPage';

interface LeadershipModuleProps {
  setActiveModule: (module: string) => void;
  setMediaFilter: (filter: string | null) => void;
}

/**
 * LeadershipModule - المكون الرئيسي لوحدة التأهيل القيادي.
 * يدير التنقل بين التبويبات المختلفة (نظرة عامة، الوحدات، المشاريع، التقويم) ويعرض المحتوى المناسب.
 * 
 * @component
 * @param {LeadershipModuleProps} props - الخصائص.
 * @returns {JSX.Element} - مكون React
 * 
 * @example
 * <LeadershipModule 
 *   setActiveModule={setActiveModule}
 *   setMediaFilter={setMediaFilter}
 * />
 */
const LeadershipModule: React.FC<LeadershipModuleProps> = ({ setActiveModule, setMediaFilter }) => {
  const { t } = useLocalization();
  const { leadershipData, dispatch } = useLeadershipData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /**
   * handleEventClick - معالج النقر على حدث للانتقال إلى صفحة تفاصيله.
   * @param {Event} event - كائن الحدث الذي تم النقر عليه.
   */
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab('overview'); // Or any other default, just to reset the main view behind
  };

  const tabs = [
    { id: 'overview', name: t('leadership.tabs.overview') },
    ...leadershipData.units.map(u => ({ id: u.id, name: t(`leadership.tabs.${u.id}`) })),
    { id: 'projects', name: t('leadership.tabs.projects') },
    { id: 'calendar', name: t('leadership.tabs.calendar') },
  ];
  
  /**
   * getTabClass - تحديد فئات CSS للتبويب بناءً على حالته (نشط/غير نشط).
   * @param {string} tabId - معرف التبويب.
   * @returns {string} - سلسلة فئات CSS.
   */
  const getTabClass = (tabId: string) => {
    return activeTab === tabId
      ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300';
  };
  
  /**
   * renderActiveTabContent - عرض محتوى التبويب النشط حاليًا.
   * @returns {JSX.Element | null} - مكون التبويب النشط.
   */
  const renderActiveTabContent = () => {
    if (activeTab === 'overview') {
      return <LeadershipOverview leadershipData={leadershipData} dispatch={dispatch} onEventClick={handleEventClick} />;
    }
    
    const activeUnit = leadershipData.units.find(u => u.id === activeTab);
    
    if (activeUnit) {
      return <LeadershipPlanView unit={activeUnit} leadershipData={leadershipData} dispatch={dispatch} onEventClick={handleEventClick} />;
    }
    
    switch (activeTab) {
      case 'projects':
        return <StudentProjectsView projects={leadershipData.studentProjects} dispatch={dispatch} />;
      case 'calendar':
        return <LeadershipCalendarView leadershipData={leadershipData} dispatch={dispatch} />;
      default:
        return null;
    }
  };
  
  if (selectedEvent) {
    return <EventPage event={selectedEvent} onBack={() => setSelectedEvent(null)} setActiveModule={setActiveModule} setMediaFilter={setMediaFilter} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
          {t('leadership.title')}
        </h1>
      </div>
      
      {/* Sub-Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-6 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${getTabClass(tab.id)}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default LeadershipModule;
