import type { GamificationData } from '../types';

export const ALL_BADGES: GamificationData['allBadges'] = [
  {
    id: 'att-1',
    name: { en: 'First Step', ar: 'الخطوة', tr: 'İlk' },
    description: { en: 'Attend one event.', ar: 'حضور', tr: 'Katıl' },
    icon: '👟',
    category: 'Attendance',
    criteria: { en: '1 event', ar: '1', tr: '1' },
    total: 1,
    points: 10,
  },
  {
    id: 'ach-1',
    name: { en: 'Rising Star', ar: 'نجم', tr: 'Yıldız' },
    description: { en: '100 points.', ar: 'نقاط', tr: 'Puan' },
    icon: '🌟',
    category: 'Achievement',
    criteria: { en: '100 pts', ar: '100', tr: '100' },
    total: 100,
    points: 0,
  },
];

export const INITIAL_USER_ACHIEVEMENT: GamificationData['userAchievement'] = {
  userId: 'user-1',
  totalPoints: 20,
  level: 'Bronze',
  earnedBadges: [{ badgeId: 'att-1', dateEarned: '2024-05-10T00:00:00Z' }],
  badgeProgress: { 'ach-1': 20 },
  pointsBreakdown: { Attendance: 10, Participation: 10, Evaluation: 0 },
};

export const MOCK_LEADERBOARD: GamificationData['leaderboard'] = [
  { id: 'user-1', name: 'Ali', avatar: 'https://picsum.photos/id/401/100/100', points: 200, level: 'Gold' },
  { id: 'user-2', name: 'Fatma', avatar: 'https://picsum.photos/id/402/100/100', points: 150, level: 'Silver' },
];
