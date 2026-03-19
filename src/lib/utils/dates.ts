import { Timestamp } from 'firebase/firestore';
import { format, isAfter, isBefore, isToday, addDays, parseISO } from 'date-fns';

export function toDate(ts: Timestamp | Date | string): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return parseISO(ts);
}

export function formatDate(ts: Timestamp | Date | string, fmt = 'dd MMM yyyy'): string {
  return format(toDate(ts), fmt);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isOverdue(dueDate: Timestamp | Date): boolean {
  const d = toDate(dueDate);
  return isBefore(d, new Date()) && !isToday(d);
}

export function isDueToday(dueDate: Timestamp | Date): boolean {
  return isToday(toDate(dueDate));
}

export function isDueWithinDays(dueDate: Timestamp | Date, days: number): boolean {
  const d = toDate(dueDate);
  const now = new Date();
  const future = addDays(now, days);
  return isAfter(d, now) && isBefore(d, future);
}

export function dateToTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(parseISO(dateStr));
}

export function timestampToInputDate(ts: Timestamp | null | undefined): string {
  if (!ts) return '';
  return format(ts.toDate(), 'yyyy-MM-dd');
}

export function getDaysUntilDue(dueDate: Timestamp | Date): number {
  const d = toDate(dueDate);
  const now = new Date();
  return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
