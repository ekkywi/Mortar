"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/history-data', label: 'History Data' },
];

export default function ProtectedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    setLogoutError('');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Logout gagal diproses.');
      }

      startTransition(() => {
        router.push('/');
      });
    } catch (error) {
      console.error('[LOGOUT_ERROR]', error);
      setLogoutError('Logout gagal. Silakan coba lagi.');
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mortar Control Center</h1>
          <p className="text-sm text-slate-500">Monitoring air real-time dan histori telemetry</p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <nav className="flex flex-wrap items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {logoutError ? <p className="text-xs text-rose-600">{logoutError}</p> : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Keluar...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
