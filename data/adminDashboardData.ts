import type { AdminDashboardData } from '../types';

export const MOCK_ADMIN_DATA: AdminDashboardData = {
  totalRegistrations: { value: 50, trend: 5 },
  totalAttendees: { value: 40, total: 50 },
  averageRating: { value: 4.5, count: 30 },
  budgetUtilization: { used: 10000, total: 20000 },
  attendanceOverTime: [
    { date: 'Jan', attendees: 20 },
    { date: 'Feb', attendees: 25 },
  ],
  registrationVsAttendance: [{ event: 'Demo event', registrations: 30, attendees: 25 }],
  eventTypeDistribution: [
    { name: 'Webinar', value: 20 },
    { name: 'Gala', value: 10 },
  ],
  ratingDistribution: [
    { rating: 5, count: 10 },
    { rating: 4, count: 5 },
  ],
  participants: [
    {
      id: 'P001',
      name: 'Aisha',
      registrationDate: '2024-06-01T10:00:00Z',
      attendanceStatus: 'Attended',
      rating: 5,
      event: 'Webinar',
      email: 'a@example.com',
    },
    {
      id: 'P002',
      name: 'John',
      registrationDate: '2024-06-02T11:00:00Z',
      attendanceStatus: 'Registered',
      event: 'Webinar',
      email: 'j@example.com',
    },
  ],
};
