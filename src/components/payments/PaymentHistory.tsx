import React from 'react';
import { TrendingDown, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Badge, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils/dates';
import type { Payment } from '@/lib/types';

interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
}

const typeConfig = {
  principal: { label: 'Principal', icon: TrendingDown, color: 'bg-blue-100 text-blue-600' },
  interest:  { label: 'Interest',  icon: TrendingUp,   color: 'bg-amber-100 text-amber-600' },
  both:      { label: 'P + I',     icon: ArrowUpDown,  color: 'bg-violet-100 text-violet-600' },
};

export function PaymentHistory({ payments, loading }: PaymentHistoryProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<TrendingDown size={28} />}
        title="No payments yet"
        description="Payments will appear here once recorded."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {payments.map((payment) => {
        const cfg = typeConfig[payment.type];
        const Icon = cfg.icon;
        return (
          <div key={payment.id} className="flex items-center gap-3 py-3.5 px-1 animate-fade-in">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(payment.amount)}
                </span>
                <Badge variant={payment.type === 'interest' ? 'warning' : payment.type === 'principal' ? 'info' : 'neutral'}>
                  {cfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{formatDate(payment.date)}</span>
                {payment.notes && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500 truncate">{payment.notes}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
