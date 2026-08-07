import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { apiClient } from '@/api/client';

export function AuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => {
      const { data } = await apiClient.get('/audit');
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            Export JSON
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by agent or ID..."
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
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">AI Agent</th>
                <th className="px-6 py-3 font-medium">Action/Decision</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Confidence</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : (
                logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" /> {log.agent}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                        {log.decision}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate" title={log.reason}>{log.reason}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${log.confidence}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-foreground">{log.confidence}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {log.status === 'Logged' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" /> {log.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Activity className="h-3.5 w-3.5" /> {log.status}
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
