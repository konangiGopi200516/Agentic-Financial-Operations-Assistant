import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Bot, CheckCircle2, ShieldAlert, ArrowRight, DollarSign } from 'lucide-react';
import { apiClient } from '@/api/client';

export function PaymentAgent() {
  const queryClient = useQueryClient();
  const [txnId, setTxnId] = useState('TXN-90452');
  const [result, setResult] = useState<any>(null);

  const verifyMutation = useMutation({
    mutationFn: async (input_val: string) => {
      const numericId = input_val.replace(/[^0-9]/g, '');
      const type = input_val.toUpperCase().includes('TKT') ? 'ticket' : 'transaction';
      await new Promise(r => setTimeout(r, 1500)); // Show bot thinking animation
      const { data } = await apiClient.post('/payment/verify', { id: numericId || '1', type });
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    }
  });

  const processRefundMutation = useMutation({
    mutationFn: async () => {
      const numericId = txnId.replace(/[^0-9]/g, '');
      const { data } = await apiClient.post('/refund/approve', { transaction_id: numericId || '1' });
      return data;
    },
    onSuccess: () => {
      setResult(null);
      setTxnId('');
      alert("Refund automatically processed and logged!");
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    }
  });

  const simulateAnalysis = () => {
    setResult(null);
    verifyMutation.mutate(txnId);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Verification Agent</h1>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-6 glass-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Verify Transaction & Recommend Action</h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="Enter Transaction ID (TXN-...) or Ticket ID (TKT-...)"
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button 
            onClick={simulateAnalysis}
            disabled={verifyMutation.isPending || !txnId}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {verifyMutation.isPending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Analyzing...</>
            ) : (
              <><Bot className="h-4 w-4" /> Analyze by Bot</>
            )}
          </button>
        </div>
      </div>

      {verifyMutation.isPending && (
        <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-4 text-muted-foreground shadow-sm animate-pulse">
          <Bot className="h-12 w-12 text-primary/50 animate-bounce" />
          <div className="space-y-2 text-center">
             <p className="font-medium text-foreground">AI is thinking...</p>
             <p className="text-sm">Checking Payment Gateway Logs...</p>
             <p className="text-sm">Verifying Merchant Settlement...</p>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Analysis Complete
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full">
              {result.confidence}% Confidence
            </div>
          </div>
          <div className="p-6">
             <div className="flex items-center gap-4 mb-8 justify-between text-sm max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-2 text-foreground font-medium">
                  <div className="bg-muted p-3 rounded-full border border-border"><DollarSign className="h-5 w-5" /></div>
                  Payment
                  <span className={`text-xs ${result.payment_status === 'Success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {result.payment_status}
                  </span>
                </div>
                <ArrowRight className="text-muted-foreground" />
                <div className="flex flex-col items-center gap-2 text-foreground font-medium">
                  <div className="bg-muted p-3 rounded-full border border-border"><ShieldAlert className="h-5 w-5" /></div>
                  Deducted
                  <span className={`text-xs ${result.deducted === 'Yes' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {result.deducted}
                  </span>
                </div>
                <ArrowRight className="text-muted-foreground" />
                <div className="flex flex-col items-center gap-2 text-foreground font-medium">
                  <div className="bg-primary/20 p-3 rounded-full border border-primary/30"><Bot className="h-5 w-5 text-primary" /></div>
                  Decision
                  <span className="text-primary text-xs">{result.decision}</span>
                </div>
             </div>
             
             <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">AI Reasoning:</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{result.reason}</p>
             </div>

             <div className="mt-6 flex justify-end gap-3">
               <button 
                 onClick={() => setResult(null)}
                 className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
               >
                 Ignore Recommendation
               </button>
               <button 
                 onClick={() => processRefundMutation.mutate()}
                 disabled={processRefundMutation.isPending}
                 className="flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
               >
                 {processRefundMutation.isPending ? (
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                 ) : (
                   <CheckCircle2 className="h-4 w-4" />
                 )}
                 {processRefundMutation.isPending ? 'Processing...' : 'Auto-Process Refund'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
