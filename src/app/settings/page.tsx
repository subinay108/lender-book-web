'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, LogOut, Shield, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logOut, resetPassword } from '@/lib/firebase/auth';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui';
import { notifySuccess, notifyError } from '@/lib/utils/notifications';
import { withAuth } from '@/lib/hooks/withAuth';

function SettingsPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [resetSent, setResetSent]   = useState(false);
  const [resetting, setResetting]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logOut();
    router.push('/login');
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetting(true);
    try {
      await resetPassword(user.email);
      setResetSent(true);
      notifySuccess('Password reset email sent. Check your inbox.');
    } catch (err) {
      console.error(err);
      notifyError('Failed to send reset email. Please try again.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <Sidebar />
      <PageWrapper title="Settings">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Profile */}
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={user?.displayName || user?.email || 'U'} size="lg" />
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                <User size={15} className="text-gray-400" />
                <span>{user?.displayName || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                <Mail size={15} className="text-gray-400" />
                <span>{user?.email}</span>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-gray-400" /> Security
            </h3>

            {resetSent && null}

            <button
              onClick={handleResetPassword}
              disabled={resetting || resetSent}
              className="flex items-center justify-between w-full text-sm text-gray-700 hover:text-gray-900 py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <span>{resetting ? 'Sending…' : resetSent ? 'Email sent!' : 'Change Password'}</span>
              <ChevronRight size={15} className="text-gray-400" />
            </button>
          </Card>

          {/* App Info */}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                <BookOpen size={15} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">LenderBook</p>
                <p className="text-xs text-gray-400">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A simple digital ledger for local money lenders. All data is securely stored
              in Firebase and accessible only by you.
            </p>
          </Card>

          {/* Logout */}
          <Button
            variant="danger"
            fullWidth
            size="lg"
            onClick={handleLogout}
            loading={loggingOut}
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </PageWrapper>
    </>
  );
}

export default withAuth(SettingsPage);
