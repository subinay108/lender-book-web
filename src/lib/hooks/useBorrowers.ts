'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllBorrowersWithStats, getBorrowerWithStats } from '@/lib/firebase/firestore';
import type { BorrowerWithStats } from '@/lib/types';

export function useBorrowers() {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState<BorrowerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBorrowersWithStats(user.uid);
      setBorrowers(data);
    } catch (err) {
      setError('Failed to load borrowers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { borrowers, loading, error, refetch: fetch };
}

export function useBorrower(borrowerId: string) {
  const { user } = useAuth();
  const [borrower, setBorrower] = useState<BorrowerWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user || !borrowerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBorrowerWithStats(user.uid, borrowerId);
      setBorrower(data);
    } catch (err) {
      setError('Failed to load borrower details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, borrowerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { borrower, loading, error, refetch: fetch };
}
