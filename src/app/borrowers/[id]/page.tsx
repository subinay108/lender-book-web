'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, MapPin, Edit3, Trash2, Plus,
  TrendingUp, AlertCircle, CheckCircle, Calendar,
} from 'lucide-react';
import { useBorrower } from '@/lib/hooks/useBorrowers';
import { usePayments } from '@/lib/hooks/usePayments';
import { useAuth } from '@/context/AuthContext';
import { deleteBorrower } from '@/lib/firebase/firestore';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Avatar, Spinner, PageLoader } from '@/components/ui';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { formatCurrency, formatDate, getDaysUntilDue } from '@/lib/utils/dates';
import { withAuth } from '@/lib/hooks/withAuth';

function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const { borrower, loading, refetch }    = useBorrower(id);
  const { payments, loading: payLoading, refetch: refetchPayments } = usePayments(id);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  if (loading) return <PageLoader />;
  if (!borrower) return (
    <PageWrapper>
      <div className="text-center py-16 text-gray-500">Borrower not found.</div>
    </PageWrapper>
  );

  const daysUntilDue = getDaysUntilDue(borrower.dueDate);
  const progress = borrower.loanAmount > 0
    ? Math.min(100, Math.round((borrower.totalPrincipalPaid / borrower.loanAmount) * 100))
    : 0;

  async function handleDelete() {
    if (!user || !confirm(`Delete ${borrower!.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteBorrower(user.uid, id);
      router.replace('/borrowers');
    } catch {
      alert('Failed to delete. Please try again.');
      setDeleting(false);
    }
  }

  function handlePaymentSuccess() {
    setShowPaymentForm(false);
    refetch();
    refetchPayments();
  }

  return (
    <>
      <Sidebar />
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link
            href="/borrowers"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft size={15} /> Back to Borrowers
          </Link>

          {/* Header Card */}
          <Card className="mb-4">
            <div className="flex items-start gap-4">
              <Avatar name={borrower.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{borrower.name}</h1>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Phone size={13} /> {borrower.phone}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={13} />
                      <span className="truncate">{borrower.address}</span>
                    </div>
                  </div>
                  <StatusBadge status={borrower.status} />
                </div>
              </div>
            </div>

            {/* Due Date Banner */}
            {borrower.status !== 'closed' && (
              <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                borrower.status === 'overdue'
                  ? 'bg-red-50 text-red-700'
                  : daysUntilDue <= 7
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                <Calendar size={15} />
                {borrower.status === 'overdue'
                  ? `Overdue by ${Math.abs(daysUntilDue)} days · Due was ${formatDate(borrower.dueDate)}`
                  : daysUntilDue === 0
                  ? 'Due today!'
                  : `Due in ${daysUntilDue} days · ${formatDate(borrower.dueDate)}`
                }
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link href={`/borrowers/${id}/edit`} className="flex-1">
                <Button variant="outline" fullWidth size="sm">
                  <Edit3 size={14} /> Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(borrower.loanAmount)}</p>
              {borrower.interestRate > 0 && (
                <p className="text-xs text-amber-600 mt-0.5">{borrower.interestRate}%/mo</p>
              )}
            </Card>
            <Card padding="sm" className="text-center bg-emerald-50 border-emerald-100">
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(borrower.totalPaid)}</p>
              <p className="text-xs text-gray-400 mt-0.5">P: {formatCurrency(borrower.totalPrincipalPaid)}</p>
            </Card>
            <Card padding="sm" className="text-center bg-red-50 border-red-100">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="text-base font-bold text-red-500">{formatCurrency(borrower.remainingDue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">I: {formatCurrency(borrower.totalInterestPaid)}</p>
            </Card>
          </div>

          {/* Progress */}
          <Card className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-brand-500" /> Recovery Progress
              </span>
              <span className="text-sm font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: progress === 100
                    ? 'linear-gradient(to right, #34d399, #10b981)'
                    : 'linear-gradient(to right, #f59e0b, #c9901a)',
                }}
              />
            </div>
            {progress === 100 && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-600">
                <CheckCircle size={14} /> Fully recovered
              </div>
            )}
          </Card>

          {/* Payment Form */}
          {showPaymentForm ? (
            <Card className="mb-4">
              <h2 className="font-semibold text-gray-900 mb-4">Record Payment</h2>
              <PaymentForm
                borrowerId={id}
                borrowerName={borrower.name}
                remainingDue={borrower.remainingDue}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentForm(false)}
              />
            </Card>
          ) : (
            borrower.status !== 'closed' && (
              <Button
                fullWidth
                className="mb-4"
                onClick={() => setShowPaymentForm(true)}
              >
                <Plus size={16} /> Record Payment
              </Button>
            )
          )}

          {/* Payment History */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-1">Payment History</h2>
            <p className="text-xs text-gray-400 mb-4">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
            <PaymentHistory payments={payments} loading={payLoading} />
          </Card>

          {/* Notes */}
          {borrower.notes && (
            <Card className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{borrower.notes}</p>
            </Card>
          )}

          {/* Meta */}
          <div className="mt-4 px-1 flex gap-4 text-xs text-gray-400">
            <span>Added {formatDate(borrower.createdAt)}</span>
            <span>Frequency: {borrower.repaymentFrequency}</span>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default withAuth(BorrowerDetailPage);
