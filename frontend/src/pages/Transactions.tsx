import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Download, CreditCard, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/currency';

export function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTxn, setNewTxn] = useState({ amount: '', customer_id: 1, payment_method: 'Credit Card', status: 'Success' });
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions');
      return data;
    },
    refetchInterval: 5000,
  });

  const filteredTransactions = transactions?.filter((tx: any) => {
    // 1. Time Filter
    let timePasses = true;
    if (timeFilter !== 'all') {
      const txTime = new Date(tx.created_at + (tx.created_at.includes('Z') ? '' : 'Z')).getTime();
      const now = new Date().getTime();
      const diff = now - txTime;
      
      if (timeFilter === '1m') timePasses = diff <= 60 * 1000;
      else if (timeFilter === '1h') timePasses = diff <= 60 * 60 * 1000;
      else if (timeFilter === '24h') timePasses = diff <= 24 * 60 * 60 * 1000;
    }
    
    // 2. Search Filter
    let searchPasses = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const numOnly = q.replace(/[^0-9]/g, '');
      searchPasses = 
        (tx.customer_name && tx.customer_name.toLowerCase().includes(q)) || 
        (tx.email && tx.email.toLowerCase().includes(q)) || 
        ('txn-' + tx.id.toString().padStart(5, '0')).includes(q) ||
        (numOnly.length > 0 && tx.id.toString().includes(numOnly));
    }
    
    return timePasses && searchPasses;
  });

  const createTxnMutation = useMutation({
    mutationFn: async (txnData: any) => {
      const { data } = await apiClient.post(`/transactions`, txnData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      setIsModalOpen(false);
      setNewTxn({ amount: '', customer_id: 1, payment_method: 'Credit Card', status: 'Success' });
    }
  });

  const handleCreateTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTxn.amount) {
      createTxnMutation.mutate(newTxn);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'suspicious': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'refunded': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'failed': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'suspicious': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
      case 'refunded': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;

    // Define CSV headers
    const headers = ['Transaction ID', 'Customer Name', 'Email', 'Amount (INR)', 'Method', 'Status', 'Refund Status', 'Date'];
    
    // Map transactions to CSV rows
    const rows = transactions.map((tx: any) => [
      `TXN-${tx.id}`,
      `"${tx.customer_name}"`, // quotes handle names with commas
      tx.email,
      tx.amount,
      tx.payment_method,
      tx.status,
      tx.refund_status,
      new Date(tx.created_at + (tx.created_at.includes('Z') ? '' : 'Z')).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            + Simulate Payment
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or customer..."
              className="h-9 w-[300px] rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Time</option>
              <option value="1m">Last 1 Minute</option>
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
            </select>
            <button className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-muted">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Transaction ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Refund Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions?.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center">No transactions found for this time period</td></tr>
              ) : (
                filteredTransactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">TXN-{tx.id.toString().padStart(5, '0')}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-foreground">{tx.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{tx.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{formatCurrency(tx.amount)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {tx.payment_method}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(tx.status)}`}>
                        {getStatusIcon(tx.status)} {tx.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {tx.refund_status !== 'none' ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          tx.refund_status === 'Refunded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {tx.refund_status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {new Date(tx.created_at + (tx.created_at.includes('Z') ? '' : 'Z')).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-foreground mb-4">Simulate New Payment</h2>
            <form onSubmit={handleCreateTxnSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Customer ID</label>
                  <input 
                    type="number" 
                    value={newTxn.customer_id}
                    onChange={(e) => setNewTxn({...newTxn, customer_id: parseInt(e.target.value) || 1})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newTxn.amount}
                    onChange={(e) => setNewTxn({...newTxn, amount: e.target.value})}
                    placeholder="99.99"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
                <select 
                  value={newTxn.payment_method}
                  onChange={(e) => setNewTxn({...newTxn, payment_method: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select 
                  value={newTxn.status}
                  onChange={(e) => setNewTxn({...newTxn, status: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspicious">Suspicious</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createTxnMutation.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createTxnMutation.isPending ? 'Processing...' : 'Simulate Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
