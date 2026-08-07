import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, AlertCircle, Bot, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/currency';

export function Tickets() {
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tickets');
      return data;
    },
  });

  // Simple frontend filter
  const tickets = allTickets?.filter((t: any) => {
    const search = searchQuery.toLowerCase();
    
    // Check Category Filter
    const issueText = (t.issue_text || t.issue || t.complaint || '').toLowerCase();
    const isRefundable = issueText.includes('refund');
    
    if (category === 'Refundable' && !isRefundable) return false;
    if (category === 'Other Issues' && isRefundable) return false;

    // Check Search Query
    return (
      (t.customer_name || '').toLowerCase().includes(search) || 
      issueText.includes(search) ||
      `TKT-${t.id}`.toLowerCase().includes(search)
    );
  });

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      setAnalyzing(id);
      const { data } = await apiClient.post(`/tickets/${id}/analyze`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      setAnalyzing(null);
    },
    onError: () => setAnalyzing(null)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ issueText: '', priority: 'High', status: 'Open', customer_id: 1, transaction_id: '' });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const { data } = await apiClient.post(`/tickets`, {
        customer_id: ticketData.customer_id, 
        transaction_id: ticketData.transaction_id || undefined,
        issue: ticketData.issueText,
        priority: ticketData.priority,
        status: ticketData.status
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      setIsModalOpen(false);
      setNewTicket({ issueText: '', priority: 'High', status: 'Open', customer_id: 1, transaction_id: '' });
    }
  });

  const handleAnalyze = (id: string) => {
    analyzeMutation.mutate(id);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicket.issueText.trim() !== "") {
      createTicketMutation.mutate(newTicket);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Create Ticket
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
              placeholder="Search tickets by ID, issue or customer..."
              className="h-9 w-[300px] rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Categories</option>
              <option value="Refundable">Refundable</option>
              <option value="Other Issues">Other Issues</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Payment Details</th>
                <th className="px-4 py-3 font-medium">Complaint</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">AI Analysis</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading tickets...
                    </div>
                  </td>
                </tr>
              ) : (
                tickets?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-foreground">
                      TKT-{ticket.id.toString().padStart(4, '0')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-medium text-foreground">{ticket.customer_name}</div>
                      {ticket.payment_amount && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Paid: <span className="font-semibold text-emerald-500">{formatCurrency(ticket.payment_amount)}</span>
                        </div>
                      )}
                      {ticket.transaction_id && (
                        <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
                          TXN-{ticket.transaction_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-sm">
                      <div className="text-sm text-foreground bg-muted/30 p-2 rounded-md border border-border/50 line-clamp-3" title={ticket.issue_text || ticket.complaint || ticket.issue}>
                        "{ticket.issue_text || ticket.complaint || ticket.issue}"
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ticket.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                          ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                        }`}>
                          {ticket.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {ticket.ai_status === 'Analyzed' || ticket.ai_status === 'Resolved' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-semibold">{ticket.confidence}% Confidence</span>
                          </div>
                          <div className="text-xs font-medium text-foreground">Action: {ticket.recommendation || ticket.suggestedAction}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Bot className="h-3 w-3" /> Ticket Agent
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-semibold">Needs Analysis</span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {ticket.ai_status !== 'Analyzed' ? (
                        <button 
                          onClick={() => handleAnalyze(ticket.id)}
                          disabled={analyzing === ticket.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                        >
                          {analyzing === ticket.id ? (
                            <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div> Analyzing...</>
                          ) : (
                            <><Bot className="h-3.5 w-3.5" /> Analyze with AI</>
                          )}
                        </button>
                      ) : (
                        <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      )}
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
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicketSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Customer ID</label>
                  <input 
                    type="number" 
                    value={newTicket.customer_id}
                    onChange={(e) => setNewTicket({...newTicket, customer_id: parseInt(e.target.value) || 1})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Transaction ID (Optional)</label>
                  <input 
                    type="number" 
                    value={newTicket.transaction_id}
                    onChange={(e) => setNewTicket({...newTicket, transaction_id: e.target.value})}
                    placeholder="e.g. 183"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    min="1"
                  />
                </div>
              </div>

              <div className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Priority:</span> Auto-calculated from transaction amount
                <div className="flex gap-3 mt-1.5 text-xs">
                  <span className="text-rose-500 font-semibold">🔴 High → $10,000+</span>
                  <span className="text-amber-500 font-semibold">🟡 Medium → $1,000–$9,999</span>
                  <span className="text-emerald-500 font-semibold">🟢 Low → &lt;$1,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select 
                  value={newTicket.status}
                  onChange={(e) => setNewTicket({...newTicket, status: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Issue / Complaint</label>
                <textarea 
                  value={newTicket.issueText}
                  onChange={(e) => setNewTicket({...newTicket, issueText: e.target.value})}
                  placeholder="Describe the problem..."
                  className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  required
                />
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
                  disabled={createTicketMutation.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createTicketMutation.isPending ? 'Saving...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
