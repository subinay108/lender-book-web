'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, ChevronRight, Calendar } from 'lucide-react';
import { useBorrowers } from '@/lib/hooks/useBorrowers';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { Avatar, StatusBadge, Spinner, EmptyState } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, getDaysUntilDue, isDueWithinDays } from '@/lib/utils/dates';
import { withAuth } from '@/lib/hooks/withAuth';
import { cn } from '@/lib/utils';

type DueFilter = 'all' | 'overdue' | 'upcoming';

function DuesPage() {
  const { borrowers, loading } = useBorrowers();
  const [filter, setFilter] = useState<DueFilter>('all');

  const { overdue, upcoming } = useMemo(() => ({
    overdue:  borrowers.filter((b) => b.status === 'overdue'),
    upcoming: borrowers.filter((b) => b.status === 'active' && isDueWithinDays(b.dueDate, 30)),
  }), [borrowers]);

  const showOverdue  = filter === 'all' || filter === 'overdue';
  const showUpcoming = filter === 'all' || filter === 'upcoming';

  return (
    <>
      <Sidebar />
      <PageWrapper title="Due Tracker">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(['all', 'overdue', 'upcoming'] as DueFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all',
                filter === f
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-75">
                {f === 'overdue' ? overdue.length : f === 'upcoming' ? upcoming.length : overdue.length + upcoming.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
        ) : (
          <div className="space-y-5">
            {/* Overdue */}
            {showOverdue && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <h2 className="font-semibold text-gray-900">Overdue</h2>
                  {overdue.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {overdue.length}
                    </span>
                  )}
                </div>
                {overdue.length === 0 ? (
                  <Card>
                    <EmptyState
                      icon={<AlertCircle size={24} />}
                      title="No overdue accounts"
                      description="All borrowers are up to date."
                    />
                  </Card>
                ) : (
                  <Card padding="none" className="divide-y divide-gray-50">
                    {overdue.map((b) => {
                      const days = Math.abs(getDaysUntilDue(b.dueDate));
                      return (
                        <Link key={b.id} href={`/borrowers/${b.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
                          <Avatar name={b.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {days} day{days !== 1 ? 's' : ''} overdue · Due was {formatDate(b.dueDate)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-red-500">{formatCurrency(b.remainingDue)}</p>
                            <p className="text-xs text-gray-400">remaining</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 ml-1" />
                        </Link>
                      );
                    })}
                  </Card>
                )}
              </div>
            )}

            {/* Upcoming */}
            {showUpcoming && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-amber-500" />
                  <h2 className="font-semibold text-gray-900">Upcoming (30 days)</h2>
                  {upcoming.length > 0 && (
                    <span className="bg-amber-100 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {upcoming.length}
                    </span>
                  )}
                </div>
                {upcoming.length === 0 ? (
                  <Card>
                    <EmptyState
                      icon={<Calendar size={24} />}
                      title="No upcoming dues"
                      description="No payments due in the next 30 days."
                    />
                  </Card>
                ) : (
                  <Card padding="none" className="divide-y divide-gray-50">
                    {upcoming
                      .sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis())
                      .map((b) => {
                        const days = getDaysUntilDue(b.dueDate);
                        return (
                          <Link key={b.id} href={`/borrowers/${b.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
                            <Avatar name={b.name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                              <p className={cn('text-xs mt-0.5', days === 0 ? 'text-red-500 font-medium' : days <= 3 ? 'text-amber-600' : 'text-gray-500')}>
                                {days === 0 ? 'Due today!' : `Due in ${days} day${days !== 1 ? 's' : ''}`} · {formatDate(b.dueDate)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-800">{formatCurrency(b.remainingDue)}</p>
                              <StatusBadge status={b.status} />
                            </div>
                            <ChevronRight size={14} className="text-gray-300 ml-1" />
                          </Link>
                        );
                      })}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </>
  );
}

export default withAuth(DuesPage);
