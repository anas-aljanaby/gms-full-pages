import React from 'react';
import type { TeamMember } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const { t } = useLocalization();

  const typeStyles = {
    staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    volunteer: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  };

  return (
    <div className="bg-card dark:bg-dark-card rounded-xl p-4 text-center shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <img
        src={member.photo}
        alt={member.name}
        className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-primary-light dark:border-primary/20"
        loading="lazy"
      />
      <h4 className="font-bold text-foreground dark:text-dark-foreground">{member.name}</h4>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeStyles[member.type]}`}>
        {t(`leadership.teamTypes.${member.type}`)}
      </span>
    </div>
  );
};

export default TeamMemberCard;