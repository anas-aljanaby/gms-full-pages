import type { Donor } from '../types';

export type DataQualityRecord = Donor;

export interface AuditLogEntry {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export const initialDataQualityData: DataQualityRecord[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    totalDonated: 7800,
    donationCount: 5,
    firstDonation: '2022-01-10T10:00:00Z',
    lastDonation: '2024-06-01T10:00:00Z',
    country: 'USA',
    avatar: 'https://picsum.photos/id/1005/100/100',
    stage: 'stewardship',
    potentialGift: 2500,
    relationshipHealth: 'Good',
    lastContact: '2024-06-15T10:00:00Z',
    tasks: [],
  },
  {
    id: 12,
    name: 'Jon Smith',
    email: 'jsmith@work.com',
    totalDonated: 1200,
    donationCount: 1,
    firstDonation: '2024-07-15T10:00:00Z',
    lastDonation: '2024-07-15T10:00:00Z',
    country: 'USA',
    avatar: 'https://picsum.photos/id/1005/100/100',
    stage: 'contacted',
    potentialGift: 1000,
    relationshipHealth: 'Moderate',
    lastContact: '2024-07-16T10:00:00Z',
    tasks: [],
  },
];

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i++) track[0][i] = i;
  for (let j = 0; j <= s2.length; j++) track[j][0] = j;
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const ind = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + ind);
    }
  }
  const distance = track[s2.length][s1.length];
  const longer = Math.max(s1.length, s2.length);
  return (1 - distance / longer) * 100;
}

export const findDuplicates = (records: DataQualityRecord[]) => {
  const duplicates: { pair: [DataQualityRecord, DataQualityRecord]; score: number }[] = [];
  const checkedIds = new Set<number>();
  for (let i = 0; i < records.length; i++) {
    if (checkedIds.has(records[i].id)) continue;
    for (let j = i + 1; j < records.length; j++) {
      if (checkedIds.has(records[j].id)) continue;
      const nameScore = calculateSimilarity(records[i].name, records[j].name);
      const countryScore = records[i].country.toLowerCase() === records[j].country.toLowerCase() ? 100 : 0;
      const emailUser1 = records[i].email.split('@')[0];
      const emailUser2 = records[j].email.split('@')[0];
      const emailScore = calculateSimilarity(emailUser1, emailUser2);
      const totalScore = nameScore * 0.5 + countryScore * 0.2 + emailScore * 0.3;
      if (totalScore > 75) {
        duplicates.push({ pair: [records[i], records[j]], score: Math.round(totalScore) });
        checkedIds.add(records[i].id);
        checkedIds.add(records[j].id);
      }
    }
  }
  return duplicates;
};

export const findFormattingErrors = (records: DataQualityRecord[]) => {
  const errors: { record: DataQualityRecord; field: string; issue: string }[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  records.forEach((r) => {
    if (r.email && !emailRegex.test(r.email)) {
      errors.push({ record: r, field: 'email', issue: 'Invalid email format' });
    }
  });
  return errors;
};

export const initialIssues = {
  duplicates: findDuplicates(initialDataQualityData),
  formatting: findFormattingErrors(initialDataQualityData),
};
