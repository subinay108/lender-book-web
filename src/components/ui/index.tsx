import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/lib/utils';

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}

const badgeVariants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger:  'bg-red-50 text-red-600 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'active' | 'overdue' | 'closed' }) {
  const map = {
    active:  { label: 'Active',  variant: 'success' as const, dot: 'bg-emerald-500' },
    overdue: { label: 'Overdue', variant: 'danger'  as const, dot: 'bg-red-500' },
    closed:  { label: 'Closed',  variant: 'neutral' as const, dot: 'bg-gray-400' },
  };
  const { label, variant, dot } = map[status];
  return (
    <Badge variant={variant}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </Badge>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
      sizes[size],
      getAvatarColor(name),
      className
    )}>
      {getInitials(name)}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-brand-500', className)}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

const alertStyles = {
  error:   'bg-red-50 text-red-700 border-red-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
};

export function Alert({ type, message, className }: AlertProps) {
  return (
    <div className={cn('px-4 py-3 rounded-xl border text-sm', alertStyles[type], className)}>
      {message}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-gray-100', className)} />;
}
