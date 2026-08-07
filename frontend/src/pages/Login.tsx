import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('gopi');
  const [password, setPassword] = useState('gopi');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('finpilot_token', data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        onLogin();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark text-foreground">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-4">
          <ShieldCheck className="h-16 w-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          FinPilot AI
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Financial Operations & Security Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-sm bg-rose-500/10 p-3 rounded border border-rose-500/20">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
