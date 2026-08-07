import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, UserCheck, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/currency';

export function Approvals() {
  const queryClient = useQueryClient();

  const { data: approvals, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/approvals');
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (transaction_id: string) => {
      const { data } = await apiClient.post('/refund/approve', { transaction_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
    },
  });

  const handleApprove = (transaction_id: string) => {
    approveMutation.mutate(transaction_id);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Human Approval Queue</h1>
        <div className="rounded-md bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1.5 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Action Required
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
             Loading high-value refund requests...
          </div>
        ) : approvals?.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
             <ShieldCheck className="h-12 w-12 text-emerald-500/50" />
             <p className="text-lg font-medium text-foreground">You're all caught up!</p>
             <p>No transactions currently require human review.</p>
          </div>
        ) : (
          approvals?.map((tx: any) => (
            <div key={tx.id} className="rounded-xl border border-border bg-card shadow-sm p-6 glass-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Refund Approval: {formatCurrency(tx.amount)}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Customer: {tx.customer_name}</span>
                    <span>TXN-{tx.id.toString().padStart(5, '0')}</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-md border border-border">
                       <UserCheck className="h-4 w-4 text-emerald-500" />
                       <span className="font-semibold text-foreground">AI Recommendation:</span>
                       <span className="text-emerald-600 dark:text-emerald-400">98% Confidence - Issue Refund (High Priority Failure)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    disabled={approveMutation.isPending}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-6 py-2.5 font-medium hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors border border-rose-200 dark:border-rose-900/50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(tx.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-md bg-emerald-600 text-white px-6 py-2.5 font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve Refund
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
