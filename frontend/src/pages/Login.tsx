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
    <div className="min-h-screen w-full flex bg-background dark text-foreground">
      {/* Left side: Image and branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black flex-col justify-center items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/bg.png" 
            alt="Financial Dashboard Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 p-12 text-center max-w-xl flex flex-col items-center">
          <ShieldCheck className="h-20 w-20 text-primary mb-6 animate-pulse" />
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Elevate Your Financial Operations
          </h1>
          <p className="text-lg text-gray-300">
            Intelligent automation, real-time analytics, and fraud detection in one secure, agentic platform.
          </p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to FinPilot AI to manage your financial operations.
            </p>
          </div>

          <div className="bg-card py-8 px-6 shadow-2xl sm:rounded-xl sm:px-10 border border-border/50 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-rose-500 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? 'Authenticating...' : 'Secure Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
