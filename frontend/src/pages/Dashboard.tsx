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
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
        <div className="h-8 w-1/2 bg-muted rounded"></div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-blue-500/10 p-2">
          <Icon className="h-4 w-4 text-blue-500" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend}
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
          <button className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">Download Report</button>
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Transaction Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI vs Human Resolution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Support Resolution: AI vs Human</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiResolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{fill: '#334155', opacity: 0.1}}
                />
                <Bar dataKey="ai" name="AI Handled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="human" name="Human Escalated" fill="#94a3b8" radius={[4, 4, 0, 0]} />
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
