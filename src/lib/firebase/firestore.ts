import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  // Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { Borrower, BorrowerFormData, BorrowerWithStats, Payment, PaymentFormData } from '@/lib/types';
import { isOverdue } from '@/lib/utils/dates';
// import { isOverdue, isDueToday } from '@/lib/utils/dates';

// ─── Paths ────────────────────────────────────────────────────────────────────

const borrowersCol = (uid: string) =>
  collection(db, 'users', uid, 'borrowers');

const borrowerDoc = (uid: string, borrowerId: string) =>
  doc(db, 'users', uid, 'borrowers', borrowerId);

const paymentsCol = (uid: string, borrowerId: string) =>
  collection(db, 'users', uid, 'borrowers', borrowerId, 'payments');

const paymentDoc = (uid: string, borrowerId: string, paymentId: string) =>
  doc(db, 'users', uid, 'borrowers', borrowerId, 'payments', paymentId);

// ─── Borrowers ────────────────────────────────────────────────────────────────

export async function addBorrower(
  uid: string,
  data: BorrowerFormData
): Promise<string> {
  const docRef = await addDoc(borrowersCol(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBorrower(
  uid: string,
  borrowerId: string,
  data: Partial<BorrowerFormData>
): Promise<void> {
  await updateDoc(borrowerDoc(uid, borrowerId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBorrower(
  uid: string,
  borrowerId: string
): Promise<void> {
  // Delete all payments first (batch delete)
  const batch = writeBatch(db);
  const paymentsSnap = await getDocs(paymentsCol(uid, borrowerId));
  paymentsSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(borrowerDoc(uid, borrowerId));
  await batch.commit();
}

export async function getBorrowers(uid: string): Promise<Borrower[]> {
  const q = query(borrowersCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Borrower));
}

export async function getBorrower(
  uid: string,
  borrowerId: string
): Promise<Borrower | null> {
  const snap = await getDoc(borrowerDoc(uid, borrowerId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Borrower;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function addPayment(
  uid: string,
  borrowerId: string,
  data: PaymentFormData
): Promise<string> {
  const docRef = await addDoc(paymentsCol(uid, borrowerId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deletePayment(
  uid: string,
  borrowerId: string,
  paymentId: string
): Promise<void> {
  await deleteDoc(paymentDoc(uid, borrowerId, paymentId));
}

export async function getPayments(
  uid: string,
  borrowerId: string
): Promise<Payment[]> {
  const q = query(paymentsCol(uid, borrowerId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
}

// ─── Enriched Data ────────────────────────────────────────────────────────────

export async function getBorrowerWithStats(
  uid: string,
  borrowerId: string
): Promise<BorrowerWithStats | null> {
  const borrower = await getBorrower(uid, borrowerId);
  if (!borrower) return null;
  const payments = await getPayments(uid, borrowerId);
  return enrichBorrower(borrower, payments);
}

export async function getAllBorrowersWithStats(
  uid: string
): Promise<BorrowerWithStats[]> {
  const borrowers = await getBorrowers(uid);
  const enriched = await Promise.all(
    borrowers.map(async (b) => {
      const payments = await getPayments(uid, b.id);
      return enrichBorrower(b, payments);
    })
  );
  return enriched;
}

function enrichBorrower(borrower: Borrower, payments: Payment[]): BorrowerWithStats {
  const totalPrincipalPaid = payments
    .filter((p) => p.type === 'principal' || p.type === 'both')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalInterestPaid = payments
    .filter((p) => p.type === 'interest')
    .reduce((sum, p) => sum + p.amount, 0);

  // For 'both' type, half goes to each (or use full amount for both counters)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingDue = Math.max(0, borrower.loanAmount - totalPrincipalPaid);

  const sortedPayments = [...payments].sort(
    (a, b) => b.date.toMillis() - a.date.toMillis()
  );
  const lastPaymentDate = sortedPayments[0]?.date;

  let status: 'active' | 'overdue' | 'closed' = 'active';
  if (remainingDue === 0) {
    status = 'closed';
  } else if (isOverdue(borrower.dueDate)) {
    status = 'overdue';
  }

  return {
    ...borrower,
    totalPaid,
    totalInterestPaid,
    totalPrincipalPaid,
    remainingDue,
    status,
    lastPaymentDate,
  };
}
