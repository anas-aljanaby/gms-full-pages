import React, { useState, useRef, useEffect } from 'react';
import type { Event, EventStatus } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatDate } from '../../../lib/utils';
import { MoreHorizontalIcon } from '../../icons/GenericIcons';
import { eventTypeToIcon } from '../../icons/LeadershipIcons';

interface EventCardProps {
  event: Event;
  dispatch: React.Dispatch<any>;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, dispatch, onClick }) => {
  const { t, language, dir } = useLocalization();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const EventIcon = eventTypeToIcon[event.type];

  const statusStyles: Record<EventStatus, string> = {
    planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    missed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  };
  
  const statusBorder: Record<EventStatus, string> = {
    planned: 'border-blue-500',
    'in-progress': 'border-yellow-500',
    completed: 'border-green-500',
    cancelled: 'border-red-500',
    missed: 'border-orange-500',
  };

  const handleStatusUpdate = (newStatus: EventStatus) => {
    let confirmAction = true;
    if (newStatus === 'cancelled') {
        confirmAction = window.confirm(t('leadership.confirmCancel'));
    }
    
    if (confirmAction) {
        dispatch({
          type: 'UPDATE_LEADERSHIP_EVENT_STATUS',
          payload: { eventId: event.id, newStatus },
        });
        const message = newStatus === 'cancelled' ? t('leadership.eventCancelled') : t('leadership.eventCompleted');
        // Placeholder for toast notification
    }
    setDropdownOpen(false);
  };
  

  return (
    <div 
        onClick={onClick}
        className={`bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-s-4 ${statusBorder[event.status]} cursor-pointer`}
        role="button"
        tabIndex={0}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="text-primary dark:text-secondary"><EventIcon /></div>
          <div>
            <h4 className="font-bold text-foreground dark:text-dark-foreground">{event.title[language]}</h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                {t(`leadership.eventTypes.${event.type}`)}
            </span>
          </div>
        </div>
        <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
            <MoreHorizontalIcon />
          </button>
          {dropdownOpen && (
            <div className={`absolute ${dir === 'ltr' ? 'right-0' : 'left-0'} mt-2 w-48 bg-card dark:bg-dark-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10`}>
              <div className="py-1">
                {event.status === 'planned' || event.status === 'missed' ? (
                  <button onClick={() => handleStatusUpdate('completed')} className="block w-full text-start px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">
                    {t('leadership.markCompleted')}
                  </button>
                ) : null}
                {event.status === 'planned' ? (
                  <button onClick={() => handleStatusUpdate('cancelled')} className="block w-full text-start px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700">
                    {t('leadership.cancelEvent')}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p className="flex items-center gap-2 rtl:flex-row-reverse"><span>👤</span><span><span className="font-semibold">{t('leadership.eventFacilitator')}:</span> {event.facilitator.name}</span></p>
        <p className="flex items-center gap-2 rtl:flex-row-reverse"><span>📅</span><span>{formatDate(event.date, language)}</span></p>
        {event.startTime && <p className="flex items-center gap-2 rtl:flex-row-reverse"><span>⏰</span><span><span className="font-semibold">{t('leadership.eventTime')}:</span> {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span></p>}
        {event.location && <p className="flex items-center gap-2 rtl:flex-row-reverse"><span>📍</span><span><span className="font-semibold">{t('leadership.eventLocation')}:</span> {event.location}</span></p>}
        {event.expectedParticipants && <p className="flex items-center gap-2 rtl:flex-row-reverse"><span>👥</span><span><span className="font-semibold">{t('leadership.eventParticipants')}:</span> {event.expectedParticipants}</span></p>}
      </div>

      <div className="flex justify-end items-center pt-3 mt-3 border-t dark:border-slate-700">
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[event.status]}`}>
          {t(`leadership.eventStatuses.${event.status}`)}
        </span>
      </div>
    </div>
  );
};

export default EventCard;