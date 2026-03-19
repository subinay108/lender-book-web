'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPayments } from '@/lib/firebase/firestore';
import type { Payment } from '@/lib/types';

export function usePayments(borrowerId: string) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user || !borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments(user.uid, borrowerId);
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, borrowerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { payments, loading, error, refetch: fetch };
}
