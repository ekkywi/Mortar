"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autentikasi gagal.');
      }

      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900 font-mono p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/70">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">MORTAR</h1>
            <p className="text-slate-500 text-sm mt-2">Monitoring Tinggi Air</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="animate-pulse">Memverifikasi...</span>
            ) : (
              'Masuk ke Dasbor'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
