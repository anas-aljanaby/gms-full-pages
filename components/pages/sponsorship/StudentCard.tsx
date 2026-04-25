import React from 'react';
import type { Student } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface StudentCardProps {
  student: Student;
  onSponsorClick: () => void;
  onManageClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onSponsorClick, onManageClick }) => {
  const { t, language } = useLocalization();

  const statusMap = {
    waiting: {
      label: t('sponsorship.filters.waiting'),
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      button: 'bg-secondary text-white hover:bg-secondary-dark',
      buttonText: t('sponsorship.actions.sponsorStudent'),
      action: onSponsorClick,
    },
    sponsored: {
      label: t('sponsorship.filters.sponsored'),
      badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      button: 'bg-primary-light text-primary dark:bg-primary/20 dark:text-secondary-light hover:bg-primary/20 dark:hover:bg-primary/30',
      buttonText: t('sponsorship.actions.manageSponsorship'),
      action: onManageClick,
    },
    graduate: {
      label: t('sponsorship.filters.graduate'),
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      button: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600',
      buttonText: t('sponsorship.actions.viewRecord'),
      action: onManageClick,
    },
  };

  const currentStatus = statusMap[student.status];
  const name = student.personalInfo.name[language === 'ar' || language === 'tr' ? 'native' : 'en'] || student.personalInfo.name.en;

  return (
    <div key={student.id} className="bg-card dark:bg-dark-card rounded-2xl shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-4 flex flex-col text-center">
      <div className="relative self-center">
        <img
          src={student.personalInfo.photo}
          alt={name}
          className="w-28 h-28 rounded-full mb-2 border-4 border-white dark:border-slate-700 shadow-lg"
          loading="lazy"
        />
        <span className={`absolute bottom-2 right-0 text-xs font-semibold px-2 py-0.5 rounded-full ${currentStatus.badge}`}>
          {currentStatus.label}
        </span>
      </div>

      <h3 className="font-bold text-lg text-foreground dark:text-dark-foreground mt-2">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{student.academicInfo.level} | {student.personalInfo.country}</p>

      <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow min-h-[60px] my-2">
        "{student.story.short}"
      </p>

      {student.status === 'sponsored' && student.sponsorship && (
        <div className="my-3 text-left">
          <p className="text-xs font-semibold text-gray-400">{t('sponsorship.card.sponsor')}: <span className="text-foreground dark:text-dark-foreground">{student.sponsorship.sponsorName}</span></p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700 mt-1">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${(student.sponsorship.paidInstallments / student.sponsorship.totalInstallments) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-500 mt-1">{t('sponsorship.card.progress', { paid: String(student.sponsorship.paidInstallments), total: String(student.sponsorship.totalInstallments) })}</p>
        </div>
      )}

      <button
        onClick={currentStatus.action}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors mt-4 ${currentStatus.button}`}
      >
        {currentStatus.buttonText}
      </button>
    </div>
  );
};

export default StudentCard;