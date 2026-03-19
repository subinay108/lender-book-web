'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { useBorrowers } from '@/lib/hooks/useBorrowers';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { BorrowerCard } from '@/components/borrowers/BorrowerCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner, EmptyState, Alert } from '@/components/ui';
import { withAuth } from '@/lib/hooks/withAuth';
import { cn } from '@/lib/utils';
import type { BorrowerFilter } from '@/lib/types';
import { isDueToday } from '@/lib/utils/dates';

const filters: { key: BorrowerFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'overdue',   label: 'Overdue' },
  { key: 'due-today', label: 'Due Today' },
  { key: 'closed',    label: 'Closed' },
];

function BorrowersPage() {
  const { borrowers, loading, error } = useBorrowers();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<BorrowerFilter>('all');

  const filtered = useMemo(() => {
    let list = borrowers;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.address.toLowerCase().includes(q)
      );
    }

    // Status filter
    switch (filter) {
      case 'overdue':
        list = list.filter((b) => b.status === 'overdue');
        break;
      case 'due-today':
        list = list.filter((b) => isDueToday(b.dueDate));
        break;
      case 'closed':
        list = list.filter((b) => b.status === 'closed');
        break;
    }

    return list;
  }, [borrowers, search, filter]);

  return (
    <>
      <Sidebar />
      <PageWrapper
        title="Borrowers"
        action={
          <Link href="/borrowers/new">
            <Button size="sm"><Plus size={15} /> Add</Button>
          </Link>
        }
      >
        {/* Search */}
        <Input
          placeholder="Search by name, phone, or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          className="mb-4"
        />

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filter === f.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              )}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-75">
                  {f.key === 'overdue'
                    ? borrowers.filter((b) => b.status === 'overdue').length
                    : f.key === 'due-today'
                    ? borrowers.filter((b) => isDueToday(b.dueDate)).length
                    : borrowers.filter((b) => b.status === 'closed').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && <Alert type="error" message={error} className="mb-4" />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={search ? 'No results found' : 'No borrowers yet'}
            description={
              search
                ? `No borrowers match "${search}"`
                : 'Add your first borrower to start tracking loans.'
            }
            action={
              !search ? (
                <Link href="/borrowers/new">
                  <Button size="sm"><Plus size={14} /> Add Borrower</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b) => <BorrowerCard key={b.id} borrower={b} />)}
          </div>
        )}
      </PageWrapper>
    </>
  );
}

export default withAuth(BorrowersPage);
