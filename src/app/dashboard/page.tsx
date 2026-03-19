'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, AlertCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBorrowers } from '@/lib/hooks/useBorrowers';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BorrowerRow } from '@/components/borrowers/BorrowerCard';
import { Spinner, EmptyState } from '@/components/ui';
import { formatCurrency, isDueWithinDays } from '@/lib/utils/dates';
import { withAuth } from '@/lib/hooks/withAuth';

function DashboardPage() {
  const { user } = useAuth();
  const { borrowers, loading } = useBorrowers();

  const stats = useMemo(() => {
    const totalBorrowers   = borrowers.length;
    const totalAmountLent  = borrowers.reduce((s, b) => s + b.loanAmount, 0);
    const totalCollected   = borrowers.reduce((s, b) => s + b.totalPaid, 0);
    const totalDue         = borrowers.reduce((s, b) => s + b.remainingDue, 0);
    const overdueCount     = borrowers.filter((b) => b.status === 'overdue').length;
    const upcomingCount    = borrowers.filter(
      (b) => b.status === 'active' && isDueWithinDays(b.dueDate, 7)
    ).length;
    return { totalBorrowers, totalAmountLent, totalCollected, totalDue, overdueCount, upcomingCount };
  }, [borrowers]);

  const recentBorrowers = borrowers.slice(0, 5);
  const overdueBorrowers = borrowers.filter((b) => b.status === 'overdue');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Sidebar />
      <PageWrapper>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Total Borrowers"
                value={stats.totalBorrowers.toString()}
                icon={<Users size={18} />}
                color="blue"
                sub={`${stats.overdueCount} overdue`}
              />
              <StatCard
                label="Total Lent"
                value={formatCurrency(stats.totalAmountLent)}
                icon={<TrendingUp size={18} />}
                color="amber"
              />
              <StatCard
                label="Total Due"
                value={formatCurrency(stats.totalDue)}
                icon={<AlertCircle size={18} />}
                color="red"
                sub={`${stats.overdueCount} overdue accounts`}
              />
              <StatCard
                label="Upcoming Dues"
                value={stats.upcomingCount.toString()}
                icon={<Clock size={18} />}
                color="purple"
                sub="within 7 days"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-6">
              <Link href="/borrowers/new" className="flex-1">
                <Button fullWidth variant="primary">
                  <Plus size={16} /> Add Borrower
                </Button>
              </Link>
              <Link href="/dues" className="flex-1">
                <Button fullWidth variant="outline">
                  <Clock size={16} /> View Dues
                </Button>
              </Link>
            </div>

            {/* Overdue Alert */}
            {overdueBorrowers.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-700">
                      {overdueBorrowers.length} Overdue {overdueBorrowers.length === 1 ? 'Account' : 'Accounts'}
                    </span>
                  </div>
                  <Link href="/dues">
                    <Button variant="danger" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {overdueBorrowers.slice(0, 2).map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="text-red-700 font-medium">{b.name}</span>
                      <span className="text-red-600 font-semibold">{formatCurrency(b.remainingDue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Borrowers */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900">Recent Borrowers</h2>
                <Link href="/borrowers" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {recentBorrowers.length === 0 ? (
                <EmptyState
                  icon={<Users size={24} />}
                  title="No borrowers yet"
                  description="Add your first borrower to get started"
                  action={
                    <Link href="/borrowers/new">
                      <Button size="sm"><Plus size={14} /> Add Borrower</Button>
                    </Link>
                  }
                />
              ) : (
                <div>
                  {recentBorrowers.map((b) => <BorrowerRow key={b.id} borrower={b} />)}
                </div>
              )}
            </div>
          </>
        )}
      </PageWrapper>
    </>
  );
}

export default withAuth(DashboardPage);
