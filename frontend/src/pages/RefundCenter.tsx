import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/currency';

export function RefundCenter() {
  const { data: refunds, isLoading } = useQuery({
    queryKey: ['refunds'],
    queryFn: async () => {
      const { data } = await apiClient.get('/refunds');
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Refund Center</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
          Process Manual Refund
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search refunds by ID..."
              className="h-9 w-[300px] rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                <th className="px-6 py-3 font-medium">Refund ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Approval</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading refunds...
                    </div>
                  </td>
                </tr>
              ) : refunds?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center">No refunds found</td></tr>
              ) : (
                refunds?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                      RFND-{tx.id.toString().padStart(5, '0')}
                      <div className="text-[10px] text-muted-foreground">TXN-{tx.id.toString().padStart(5, '0')}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{tx.customer_name}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{formatCurrency(tx.amount)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tx.refund_status === 'Refunded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {tx.refund_status === 'Refunded' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                        {tx.refund_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {parseFloat(tx.amount) > 1000 ? (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded px-1.5 py-0.5">Manager Required</span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded px-1.5 py-0.5">Auto-Approved (AI)</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {tx.refund_status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                           <button className="rounded-md border border-input bg-background p-1.5 hover:bg-muted text-emerald-600 dark:text-emerald-400 transition-colors" title="Approve">
                             <CheckCircle2 className="h-4 w-4" />
                           </button>
                           <button className="rounded-md border border-input bg-background p-1.5 hover:bg-muted text-rose-600 dark:text-rose-400 transition-colors" title="Reject">
                             <XCircle className="h-4 w-4" />
                           </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Processed</span>
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
