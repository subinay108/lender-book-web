import { Timestamp } from 'firebase/firestore';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ─── Borrower ─────────────────────────────────────────────────────────────────

export type RepaymentFrequency = 'daily' | 'weekly' | 'monthly' | 'one-time';
export type LoanStatus = 'active' | 'overdue' | 'closed';

export interface Borrower {
  id: string;
  name: string;
  phone: string;
  address: string;
  loanAmount: number;
  interestRate: number;       // % per month
  startDate: Timestamp;
  dueDate: Timestamp;
  repaymentFrequency: RepaymentFrequency;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Borrower enriched with computed payment data
export interface BorrowerWithStats extends Borrower {
  totalPaid: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  remainingDue: number;
  status: LoanStatus;
  lastPaymentDate?: Timestamp;
}

export type BorrowerFormData = Omit<Borrower, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentType = 'principal' | 'interest' | 'both';

export interface Payment {
  id: string;
  amount: number;
  type: PaymentType;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export type PaymentFormData = Omit<Payment, 'id' | 'createdAt'>;

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalBorrowers: number;
  totalAmountLent: number;
  totalCollected: number;
  totalDue: number;
  overdueCount: number;
  upcomingDueCount: number;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export type BorrowerFilter = 'all' | 'due-today' | 'overdue' | 'closed';
