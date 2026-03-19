'use client';

import React, { useState } from 'react';
// import { Timestamp } from 'firebase/firestore';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { addBorrower, updateBorrower } from '@/lib/firebase/firestore';
import { dateToTimestamp, timestampToInputDate } from '@/lib/utils/dates';
import type { Borrower, BorrowerFormData, RepaymentFrequency } from '@/lib/types';

interface BorrowerFormProps {
  borrower?: Borrower;
  onSuccess: (id: string) => void;
  onCancel?: () => void;
}

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'daily',   label: 'Daily' },
  { value: 'one-time',label: 'One-time' },
];

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  loanAmount?: string;
  interestRate?: string;
  startDate?: string;
  dueDate?: string;
}

export function BorrowerForm({ borrower, onSuccess, onCancel }: BorrowerFormProps) {
  const { user } = useAuth();
  const isEdit = !!borrower;

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name:               borrower?.name || '',
    phone:              borrower?.phone || '',
    address:            borrower?.address || '',
    loanAmount:         borrower?.loanAmount?.toString() || '',
    interestRate:       borrower?.interestRate?.toString() || '0',
    startDate:          borrower ? timestampToInputDate(borrower.startDate) : today,
    dueDate:            borrower ? timestampToInputDate(borrower.dueDate) : '',
    repaymentFrequency: (borrower?.repaymentFrequency || 'monthly') as RepaymentFrequency,
    notes:              borrower?.notes || '',
  });

  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim())          errs.name       = 'Name is required';
    if (!form.phone.trim())         errs.phone      = 'Phone is required';
    if (!form.address.trim())       errs.address    = 'Address is required';
    if (!form.loanAmount || isNaN(Number(form.loanAmount)) || Number(form.loanAmount) <= 0)
      errs.loanAmount = 'Enter a valid loan amount';
    if (isNaN(Number(form.interestRate)) || Number(form.interestRate) < 0)
      errs.interestRate = 'Enter a valid interest rate';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.dueDate)   errs.dueDate   = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const data: BorrowerFormData = {
        name:               form.name.trim(),
        phone:              form.phone.trim(),
        address:            form.address.trim(),
        loanAmount:         Number(form.loanAmount),
        interestRate:       Number(form.interestRate),
        startDate:          dateToTimestamp(form.startDate),
        dueDate:            dateToTimestamp(form.dueDate),
        repaymentFrequency: form.repaymentFrequency,
        notes:              form.notes.trim() || undefined,
      };

      if (isEdit && borrower) {
        await updateBorrower(user.uid, borrower.id, data);
        onSuccess(borrower.id);
      } else {
        const id = await addBorrower(user.uid, data);
        onSuccess(id);
      }
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && <Alert type="error" message={apiError} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. Rajesh Kumar"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Phone Number"
          placeholder="98XXXXXXXX"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={errors.phone}
          required
        />
      </div>

      <Input
        label="Address"
        placeholder="Full address"
        value={form.address}
        onChange={(e) => set('address', e.target.value)}
        error={errors.address}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Loan Amount (₹)"
          type="number"
          placeholder="50000"
          min="0"
          value={form.loanAmount}
          onChange={(e) => set('loanAmount', e.target.value)}
          error={errors.loanAmount}
          required
        />
        <Input
          label="Interest Rate (% / month)"
          type="number"
          placeholder="2.5"
          min="0"
          step="0.1"
          value={form.interestRate}
          onChange={(e) => set('interestRate', e.target.value)}
          error={errors.interestRate}
          hint="Leave 0 for interest-free"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={(e) => set('startDate', e.target.value)}
          error={errors.startDate}
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          error={errors.dueDate}
          required
        />
      </div>

      <Select
        label="Repayment Frequency"
        value={form.repaymentFrequency}
        onChange={(e) => set('repaymentFrequency', e.target.value)}
        options={frequencyOptions}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Loan purpose, collateral, other info..."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={3}
      />

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? 'Save Changes' : 'Add Borrower'}
        </Button>
      </div>
    </form>
  );
}
