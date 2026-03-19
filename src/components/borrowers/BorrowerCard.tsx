import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import { Avatar, StatusBadge } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils/dates';
import type { BorrowerWithStats } from '@/lib/types';

interface BorrowerCardProps {
  borrower: BorrowerWithStats;
}

export function BorrowerCard({ borrower }: BorrowerCardProps) {
  const progress = borrower.loanAmount > 0
    ? Math.min(100, Math.round((borrower.totalPrincipalPaid / borrower.loanAmount) * 100))
    : 0;

  return (
    <Link href={`/borrowers/${borrower.id}`}>
      <Card hoverable className="animate-fade-in">
        <div className="flex items-start gap-3">
          <Avatar name={borrower.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{borrower.name}</h3>
              <StatusBadge status={borrower.status} />
            </div>

            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <Phone size={11} />
              <span>{borrower.phone}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} />
              <span className="truncate">{borrower.address}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div>
              <p className="text-xs text-gray-500">Lent</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(borrower.loanAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-sm font-semibold text-emerald-600">{formatCurrency(borrower.totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-sm font-semibold text-red-500">{formatCurrency(borrower.remainingDue)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <TrendingUp size={10} /> Recovery
              </span>
              <span className="text-xs font-medium text-gray-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>Due: {formatDate(borrower.dueDate)}</span>
            {borrower.interestRate > 0 && (
              <span>{borrower.interestRate}%/mo interest</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── List row variant ─────────────────────────────────────────────────────────

export function BorrowerRow({ borrower }: BorrowerCardProps) {
  return (
    <Link href={`/borrowers/${borrower.id}`} className="block">
      <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
        <Avatar name={borrower.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{borrower.name}</p>
          <p className="text-xs text-gray-500">{borrower.phone}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-red-500">{formatCurrency(borrower.remainingDue)}</p>
          <p className="text-xs text-gray-400">remaining</p>
        </div>
        <StatusBadge status={borrower.status} />
        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
      </div>
    </Link>
  );
}
