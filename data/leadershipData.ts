import type { LeadershipData, TeamMember, QuranicStation } from '../types';

const createTeamMemberMap = (data: LeadershipData): Map<string, TeamMember> => {
  const map = new Map<string, TeamMember>();
  data.units.forEach((unit) => {
    unit.team.forEach((member) => {
      map.set(member.name, member);
    });
  });
  return map;
};

const emptyNotes = { en: '', ar: '', tr: '' };
const qStation = (week: number, status: 'completed' | 'in-progress' | 'upcoming', isCurrent: boolean): QuranicStation => ({
  week,
  status,
  isCurrent,
  dateRange: { en: `Week ${week}`, ar: `أسبوع ${week}`, tr: `Hafta ${week}` },
  content: { en: 'Sample surah focus', ar: 'تركيز سورة', tr: 'Sure odağı' },
  notes: emptyNotes,
});

/** Demo: one unit, a few events; quranic stations trimmed from 40+ to 2 each. */
const rawData: Omit<LeadershipData, 'units'> & { units: any[] } = {
  quranicTimeline: {
    secondSemester: [qStation(1, 'completed', false), qStation(2, 'in-progress', true)],
    firstSemester: [qStation(1, 'upcoming', false)],
    summerBreak: [qStation(1, 'upcoming', false)],
  },
  studentProjects: [
    {
      id: 'proj-1',
      title: { en: 'Iftar drive', ar: 'إفطار', tr: 'İftar' },
      student: { id: 'stud-1', name: 'Ahmad Ali', photo: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=200&auto=format&fit=crop' },
      category: 'community-service',
      status: 'active',
      startDate: '2025-03-01T00:00:00Z',
      endDate: '2025-03-29T00:00:00Z',
      mentor: 'Ahmad Example',
      description: { en: 'Demo student project.', ar: 'مشروع تجريبي.', tr: 'Demo proje.' },
      progress: 50,
      impact: { beneficiaries: 100 },
    },
    {
      id: 'proj-2',
      title: { en: 'Recycling', ar: 'تدوير', tr: 'Geri dönüşüm' },
      student: { id: 'stud-2', name: 'Fatma Hassan', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      category: 'environmental',
      status: 'completed',
      startDate: '2024-09-15T00:00:00Z',
      endDate: '2024-12-15T00:00:00Z',
      mentor: 'Omar Example',
      description: { en: 'Campus recycling — demo.', ar: 'تدوير — تجريبي.', tr: 'Kampüs — demo.' },
      progress: 100,
      impact: { recycledKg: 50 },
    },
  ],
  units: [
    {
      id: 'educational',
      name: { en: 'Educational Development', ar: 'البناء التربوي', tr: 'Eğitim Geliştirme' },
      team: [
        {
          id: 't-ahmad',
          name: 'Ahmad Example',
          type: 'volunteer',
          photo: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
        },
        {
          id: 't-omar',
          name: 'Omar Example',
          type: 'volunteer',
          photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop',
        },
      ],
      stages: [
        {
          id: 's1',
          title: { en: 'Current Semester', ar: 'الفصل الحالي', tr: 'Güncel Dönem' },
          events: [
            {
              id: 'e1',
              title: { en: 'Workshop: Values', ar: 'ورشة: القيم', tr: 'Atölye: Değerler' },
              type: 'workshop',
              facilitator: 'Ahmad Example',
              date: '2024-05-10T10:00:00Z',
              status: 'completed',
              completionDate: '2024-05-10T10:00:00Z',
              attendanceRate: 90,
              location: 'Hall A',
              startTime: '10:00',
              endTime: '12:00',
              budget: 500,
              duration: 120,
            },
            {
              id: 'e2',
              title: { en: 'Lecture: Planning', ar: 'محاضرة: التخطيط', tr: 'Ders: Planlama' },
              type: 'lecture',
              facilitator: 'Omar Example',
              date: '2024-09-15T10:00:00Z',
              status: 'planned',
              startTime: '10:00',
              endTime: '11:00',
              location: 'Room 1',
            },
          ],
        },
      ],
    },
  ],
};

const teamMemberMap = createTeamMemberMap(rawData as LeadershipData);

const processedUnits = rawData.units.map((unit) => ({
  ...unit,
  stages: unit.stages.map((stage: any) => ({
    ...stage,
    events: stage.events.map((event: any) => ({
      ...event,
      category: unit.id,
      facilitator: teamMemberMap.get(event.facilitator) || {
        id: 'unknown',
        name: event.facilitator,
        type: 'staff',
        photo: '',
      },
    })),
  })),
}));

export const initialLeadershipData: LeadershipData = {
  ...rawData,
  units: processedUnits,
};
