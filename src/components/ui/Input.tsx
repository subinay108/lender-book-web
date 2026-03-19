import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={cn(
            'w-full h-10 rounded-xl border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
            'transition-all duration-150',
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
            leftIcon && 'pl-9',
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={cn(
          'w-full h-10 rounded-xl border bg-white px-3 text-sm text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150',
          error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={cn(
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150',
          error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
