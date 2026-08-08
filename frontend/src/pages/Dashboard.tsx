import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis 
} from 'recharts';
import { Activity, CreditCard, AlertTriangle, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/currency';

const revenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 2400 },
  { name: 'Fri', total: 3200 },
  { name: 'Sat', total: 2800 },
  { name: 'Sun', total: 3600 },
];

const aiResolutionData = [
  { name: 'Week 1', ai: 40, human: 60 },
  { name: 'Week 2', ai: 55, human: 45 },
  { name: 'Week 3', ai: 70, human: 30 },
  { name: 'Week 4', ai: 85, human: 15 },
];

function StatCard({ title, value, icon: Icon, trend, trendUp, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse border border-border">
        <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
        <div className="h-8 w-1/2 bg-muted rounded"></div>
      </div>
    );
  }
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 border border-border/50 bg-gradient-to-br from-card to-card/50">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <div className="rounded-xl bg-primary/10 p-2.5 ring-1 ring-primary/20 group-hover:bg-primary/30 group-hover:ring-primary/40 transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 relative z-10">
        <span className="text-4xl font-black tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${trendUp ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'}`}>
            {trend} vs last month
          </span>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payout, setPayout] = useState({ customer_id: 1, amount: '', method: 'Bank Transfer' });

  const payoutMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create a transaction that represents a payout to a client (negative amount or distinct method)
      const res = await apiClient.post('/transactions', {
        customer_id: data.customer_id,
        amount: -Math.abs(parseFloat(data.amount)), // Store as negative to indicate money going OUT
        payment_method: `Payout: ${data.method}`,
        status: 'Success'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsPayoutModalOpen(false);
      setPayout({ customer_id: 1, amount: '', method: 'Bank Transfer' });
      alert("Payout successfully sent and recorded in Transactions!");
    }
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard');
      return data;
    },
    refetchInterval: 10000,
  });

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payout.amount) {
      payoutMutation.mutate(payout);
    }
  };

  const handleDownloadReport = () => {
    if (!metrics) {
      alert("Metrics not loaded yet!");
      return;
    }
    const reportData = `FinPilot AI - Dashboard Report
Date: ${new Date().toLocaleString()}

--- METRICS ---
Total Revenue: ${formatCurrency(metrics.todayRevenue)}
Active Tickets: ${metrics.activeTickets}
AI Accuracy: ${metrics.aiAccuracy}%
Pending Refunds: ${metrics.pendingRefunds}
Fraud Alerts: ${metrics.fraudAlerts}
Total Customers: ${metrics.totalCustomers}

--- WEEKLY AI RESOLUTION ---
${aiResolutionData.map(d => `${d.name}: AI Handled ${d.ai}%, Human Escalated ${d.human}%`).join('\n')}
`;
    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finpilot_report_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPayoutModalOpen(true)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Pay Client
          </button>
          <button onClick={handleDownloadReport} className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">Download Report</button>
        </div>
      </div>

      {/* Professional Banner */}
      <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-sm border border-border">
        <img 
          src="/dashboard_banner.png" 
          alt="Financial Dashboard Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to FinPilot AI</h2>
            <p className="text-gray-300 text-sm">
              Your autonomous financial operations center is running smoothly. Agents are actively monitoring transactions and securing the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Revenue" 
          value={metrics ? formatCurrency(metrics.todayRevenue) : '₹0'} 
          icon={CreditCard} 
          trend="+12.5%" 
          trendUp={true} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Active Tickets" 
          value={metrics?.activeTickets || 0} 
          icon={Activity} 
          trend="-4.2%" 
          trendUp={true} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="AI Accuracy" 
          value={metrics ? `${metrics.aiAccuracy}%` : '0%'} 
          icon={ShieldCheck} 
          trend="+18.1%" 
          trendUp={true} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Pending Refunds" 
          value={metrics?.pendingRefunds || 0} 
          icon={TrendingUp} 
          trend="-2" 
          trendUp={true} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Fraud Alerts" 
          value={metrics?.fraudAlerts || 0} 
          icon={AlertTriangle} 
          trend="+1" 
          trendUp={false} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Customers" 
          value={metrics?.totalCustomers || 0} 
          icon={Users} 
          trend="+84" 
          trendUp={true} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Trend */}
        <div className="glass-card relative overflow-hidden rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
          <h3 className="mb-6 text-lg font-bold tracking-tight flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Transaction Volume</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI vs Human Resolution */}
        <div className="glass-card relative overflow-hidden rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl -z-10"></div>
          <h3 className="mb-6 text-lg font-bold tracking-tight flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-purple-500" /> Support Resolution</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiResolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  cursor={{fill: '#334155', opacity: 0.15}}
                />
                <Bar dataKey="ai" name="AI Handled" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="human" name="Human Escalated" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-foreground mb-4">Send Payout to Client</h2>
            <form onSubmit={handlePayoutSubmit} className="flex flex-col gap-4">
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Client ID</label>
                <input 
                  type="number" 
                  value={payout.customer_id}
                  onChange={(e) => setPayout({...payout, customer_id: parseInt(e.target.value) || 1})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Payout Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={payout.amount}
                  onChange={(e) => setPayout({...payout, amount: e.target.value})}
                  placeholder="e.g. 500.00"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  min="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Transfer Method</label>
                <select 
                  value={payout.method}
                  onChange={(e) => setPayout({...payout, method: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Crypto">Crypto (USDC)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={payoutMutation.isPending}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {payoutMutation.isPending ? 'Sending...' : 'Send Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
