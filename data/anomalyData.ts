import type { KpiDataPoint } from '../types';

const daysAgo = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString().split('T')[0];
};

/** Small static series (avoids 50+ random points at load). */
export const KPI_TIME_SERIES_DATA: Record<string, KpiDataPoint[]> = {
  dailyDonations: [
    { date: daysAgo(5), value: 1200 },
    { date: daysAgo(4), value: 1300 },
    { date: daysAgo(3), value: 5000 },
    { date: daysAgo(2), value: 1250 },
    { date: daysAgo(1), value: 1280 },
  ],
  websiteVisitors: [
    { date: daysAgo(4), value: 800 },
    { date: daysAgo(3), value: 150 },
    { date: daysAgo(2), value: 820 },
  ],
  newSignups: [
    { date: daysAgo(3), value: 50 },
    { date: daysAgo(2), value: 0 },
    { date: daysAgo(1), value: 48 },
  ],
};
