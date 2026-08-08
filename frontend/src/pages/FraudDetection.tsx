import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Search, Filter, AlertTriangle, ShieldX, MapPin, Smartphone, Activity, Bot, User } from 'lucide-react';
import { apiClient } from '@/api/client';

export function FraudDetection() {
  const queryClient = useQueryClient();

  const { data: fraudCases, isLoading } = useQuery({
    queryKey: ['fraud'],
    queryFn: async () => {
      const { data } = await apiClient.get('/fraud');
      return data;
    },
  });

  const freezeMutation = useMutation({
    mutationFn: async (case_id: string) => {
      const { data } = await apiClient.post('/fraud/check', { case_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    }
  });

  const ignoreMutation = useMutation({
    mutationFn: async (case_id: string) => {
      const { data } = await apiClient.post('/fraud/ignore', { case_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    }
  });

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (score >= 75) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fraud Detection Engine</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 transition-colors flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Global Freeze
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">High Risk Active</h3>
          <div className="text-3xl font-bold text-rose-500">12</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Medium Risk</h3>
          <div className="text-3xl font-bold text-orange-500">34</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Accounts Blocked Today</h3>
          <div className="text-3xl font-bold text-foreground">8</div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by case ID or customer..."
              className="h-9 w-[300px] rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-muted">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Case ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Risk Score</th>
                <th className="px-6 py-3 font-medium">Flag Reason</th>
                <th className="px-6 py-3 font-medium">Context</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
                      Analyzing fraud signals...
                    </div>
                  </td>
                </tr>
              ) : fraudCases?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center">No fraud cases found</td></tr>
              ) : (
                fraudCases?.map((caseItem: any) => (
                  <tr key={caseItem.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                      FRD-{caseItem.id.toString().padStart(4, '0')}
                      <div className="text-[10px] text-muted-foreground mt-0.5">TXN-{caseItem.transaction_id}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-semibold text-foreground">{caseItem.customer_name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-bold ${getRiskScoreColor(caseItem.risk_score)}`}>
                        {caseItem.risk_score} / 100
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="font-medium text-foreground">{caseItem.reason}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {caseItem.location || 'Unknown Location'}</div>
                        <div className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-muted-foreground" /> {caseItem.device_info || 'Unknown Device'}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {caseItem.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {caseItem.risk_score < 40 ? (
                            <button 
                              onClick={() => ignoreMutation.mutate(caseItem.id)}
                              disabled={ignoreMutation.isPending}
                              className="flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                               <Bot className="h-3.5 w-3.5" /> {ignoreMutation.isPending ? 'Ignoring...' : 'Bot: Auto-Ignore'}
                            </button>
                          ) : caseItem.risk_score >= 80 ? (
                            <button 
                              onClick={() => freezeMutation.mutate(caseItem.id)}
                              disabled={freezeMutation.isPending}
                              className="flex items-center gap-1.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-3 py-1.5 font-semibold hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                            >
                               <User className="h-3.5 w-3.5" /> {freezeMutation.isPending ? 'Processing...' : 'Manual Process'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => freezeMutation.mutate(caseItem.id)}
                              disabled={freezeMutation.isPending}
                              className="flex items-center gap-1.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1.5 font-semibold hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                            >
                               <Activity className="h-3.5 w-3.5" /> {freezeMutation.isPending ? 'Processing...' : 'Verify Risk'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${
                          caseItem.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          caseItem.status === 'Blocked' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {caseItem.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
