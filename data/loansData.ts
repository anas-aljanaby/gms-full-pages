
import type { Loan, RepaymentInstallment, LoansData } from '../types';

const mkSchedule = (loanId: string, amounts: { due: string; amount: number; status: RepaymentInstallment['status'] }[]): RepaymentInstallment[] =>
  amounts.map((a, i) => ({
    id: `${loanId}-i${i + 1}`,
    loanId,
    installmentNumber: i + 1,
    dueDate: a.due,
    amount: a.amount,
    status: a.status,
    paidDate: a.status === 'Paid' ? a.due : undefined,
  }));

const MOCK_LOANS: Loan[] = [
  {
    id: 'L001',
    borrowerName: 'أحمد',
    type: 'educational',
    amount: 5000,
    currency: 'USD',
    issueDate: '2024-03-01T00:00:00Z',
    status: 'Active',
    repaymentSchedule: mkSchedule('L001', [
      { due: '2024-04-01T00:00:00Z', amount: 1000, status: 'Paid' },
      { due: '2024-05-01T00:00:00Z', amount: 1000, status: 'Paid' },
      { due: '2024-12-01T00:00:00Z', amount: 3000, status: 'Due' },
    ]),
    donorId: 'DN-001',
    stakeholderId: 1,
    projectId: 'PROJ-DEMO-1',
    financeEntryId: 'FIN-L001',
  },
  {
    id: 'L002',
    borrowerName: 'سارة',
    type: 'operational',
    amount: 3000,
    currency: 'USD',
    issueDate: '2024-01-15T00:00:00Z',
    status: 'Active',
    repaymentSchedule: mkSchedule('L002', [
      { due: '2024-02-15T00:00:00Z', amount: 1500, status: 'Paid' },
      { due: '2024-12-15T00:00:00Z', amount: 1500, status: 'Due' },
    ]),
    donorId: 'DN-002',
    stakeholderId: 2,
    financeEntryId: 'FIN-L002',
  },
];

export const MOCK_LOANS_DATA: LoansData = {
  loans: MOCK_LOANS,
};
