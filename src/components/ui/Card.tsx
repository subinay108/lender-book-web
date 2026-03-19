import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, onClick, hoverable, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hoverable && 'hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: 'amber' | 'green' | 'red' | 'blue' | 'purple';
}

const colorMap = {
  amber:  { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',  text: 'text-amber-600' },
  green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
  red:    { bg: 'bg-red-50',     icon: 'bg-red-100 text-red-500',      text: 'text-red-500' },
  blue:   { bg: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',    text: 'text-blue-600' },
  purple: { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600', text: 'text-violet-600' },
};

export function StatCard({ label, value, sub, icon, color = 'amber' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card className={cn('flex items-start gap-4', c.bg, 'border-0')}>
      <div className={cn('p-2.5 rounded-xl', c.icon)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {sub && <p className={cn('text-xs mt-0.5', c.text)}>{sub}</p>}
      </div>
    </Card>
  );
}
