'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Clock, Settings, LogOut,
  BookOpen, Menu, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { logOut } from '@/lib/firebase/auth';
import { Avatar } from '@/components/ui';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/borrowers', label: 'Borrowers',  icon: Users },
  { href: '/dues',      label: 'Dues',        icon: Clock },
  { href: '/settings',  label: 'Settings',    icon: Settings },
];

function NavLink({ href, label, icon: Icon, onClick }: {
  href: string; label: string; icon: React.ElementType; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
      {label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />}
    </Link>
  );
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen px-4 py-6 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">LenderBook</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar name={user?.displayName || user?.email || 'U'} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Header ─────────────────────────────────────────────────────────────

export function MobileHeader({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">{title || 'LenderBook'}</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
          <Menu size={20} className="text-gray-700" />
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar name={user?.displayName || user?.email || 'U'} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Bottom Nav (mobile) ─────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2.5 gap-1 text-xs font-medium transition-colors',
              active ? 'text-brand-600' : 'text-gray-500'
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export function PageWrapper({ children, title, action }: PageWrapperProps) {
  return (
    <div className="lg:pl-64">
      <MobileHeader title={title} />
      <main className="min-h-screen bg-gray-50 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {(title || action) && (
            <div className="flex items-center justify-between mb-6">
              {title && <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">{title}</h1>}
              {action && <div>{action}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
