'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { addPayment } from '@/lib/firebase/firestore';
import { dateToTimestamp } from '@/lib/utils/dates';
import type { PaymentType } from '@/lib/types';

interface PaymentFormProps {
  borrowerId: string;
  borrowerName: string;
  remainingDue: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

const typeOptions = [
  { value: 'principal', label: 'Principal' },
  { value: 'interest',  label: 'Interest' },
  { value: 'both',      label: 'Principal + Interest' },
];

export function PaymentForm({ borrowerId, borrowerName, remainingDue, onSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    amount: '',
    type:   'principal' as PaymentType,
    date:   today,
    notes:  '',
  });
  const [errors, setErrors]   = useState<{ amount?: string; date?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await addPayment(user.uid, borrowerId, {
        amount: Number(form.amount),
        type:   form.type,
        date:   dateToTimestamp(form.date),
        notes:  form.notes.trim() || undefined,
      });
      onSuccess();
    } catch {
      setApiError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && <Alert type="error" message={apiError} />}

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <p className="text-xs text-amber-700 font-medium">Recording payment for</p>
        <p className="text-sm font-bold text-amber-900">{borrowerName}</p>
        {remainingDue > 0 && (
          <p className="text-xs text-amber-600 mt-0.5">
            Remaining due: ₹{remainingDue.toLocaleString('en-IN')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount (₹)"
          type="number"
          placeholder="0"
          min="1"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          error={errors.amount}
          required
        />
        <Select
          label="Payment Type"
          value={form.type}
          onChange={(e) => set('type', e.target.value)}
          options={typeOptions}
        />
      </div>

      <Input
        label="Payment Date"
        type="date"
        value={form.date}
        onChange={(e) => set('date', e.target.value)}
        error={errors.date}
        required
      />

      <Textarea
        label="Notes (optional)"
        placeholder="EMI, partial payment, etc."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={2}
      />

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          Record Payment
        </Button>
      </div>
    </form>
  );
}
