import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, CheckCircle2, Clock, Activity, Cpu, Sparkles, BrainCircuit, ShieldAlert, MessageSquare } from 'lucide-react';
import { apiClient } from '@/api/client';

export function AIAgents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agentsStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/agents/status');
      return data;
    },
    refetchInterval: 5000,
  });

  const agent = agents?.[0];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Core Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time status of the unified LLaMA-3.1 model powering FinPilot.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-md text-sm font-semibold border border-emerald-200 dark:border-emerald-500/30">
          <Activity className="h-4 w-4" /> System Healthy
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground flex items-center justify-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          Loading AI Core status...
        </div>
      ) : agent ? (
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 glass-card relative overflow-hidden">
          {agent.status === 'Running' && (
            <div className="absolute top-0 right-0 h-1.5 w-full bg-primary/20">
              <div className="h-full bg-primary w-1/3 animate-[slide_2s_ease-in-out_infinite]"></div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 border-b border-border pb-8">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-primary/20 text-primary shadow-inner">
                <BrainCircuit className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{agent.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold">
                    <Sparkles className="h-4 w-4" /> Powered by {agent.model}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                    <Cpu className="h-4 w-4 animate-pulse" /> {agent.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 w-full lg:w-auto bg-muted/30 p-4 rounded-xl border border-border">
              <div className="text-center px-4 border-r border-border">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Global Accuracy</div>
                <div className="text-2xl font-bold text-foreground">{agent.accuracy}%</div>
              </div>
              <div className="text-center px-4 border-r border-border">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-foreground">{agent.avgTime}</div>
              </div>
              <div className="text-center px-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Operations</div>
                <div className="text-2xl font-bold text-foreground">{(agent.processed / 1000).toFixed(1)}k</div>
              </div>
            </div>
          </div>

          <div className="bg-black/5 dark:bg-black/20 rounded-xl p-5 mb-8 border border-border font-mono text-muted-foreground flex items-center gap-3 shadow-inner">
            <span className="text-primary font-bold text-lg">{">"}</span> 
            <span className="text-base text-foreground">{agent.currentTask}</span>
            {agent.status === 'Running' && <span className="animate-pulse text-primary text-lg">_</span>}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-foreground font-semibold">
                <MessageSquare className="h-5 w-5 text-blue-500" /> Ticket Analysis
              </div>
              <p className="text-sm text-muted-foreground">Autonomously reads customer complaints, identifies context, and determines resolution priority.</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-foreground font-semibold">
                <ShieldAlert className="h-5 w-5 text-rose-500" /> Fraud Detection
              </div>
              <p className="text-sm text-muted-foreground">Scans real-time transactions for anomalies, scoring risk and freezing suspicious accounts.</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-foreground font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Payment Verification
              </div>
              <p className="text-sm text-muted-foreground">Verifies database logs to auto-approve or reject refunds without human intervention.</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <h3 className="text-xl font-bold text-foreground mb-6">AI Architecture Flow</h3>
            
            {/* Visual Diagram */}
            <div className="relative p-8 rounded-xl bg-muted/20 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Inputs */}
              <div className="flex flex-col gap-4 w-full md:w-1/4">
                <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
                  <div className="font-semibold text-sm">Customer Requests</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
                  <div className="font-semibold text-sm">Transaction Logs</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
                  <div className="font-semibold text-sm">System Events</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center text-primary/50">
                <div className="h-0.5 w-16 bg-primary/50 relative">
                  <div className="absolute right-0 -top-1.5 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary/50"></div>
                </div>
              </div>

              {/* Core Engine */}
              <div className="bg-primary/10 border-2 border-primary/40 p-6 rounded-2xl shadow-lg w-full md:w-1/3 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Groq LLaMA-3.1
                </div>
                <BrainCircuit className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-lg text-foreground mb-1">FinPilot AI Core</h4>
                <p className="text-xs text-muted-foreground">Unified LLM Processing Hub</p>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background rounded p-1.5 border border-border font-medium">NLP Parsing</div>
                  <div className="bg-background rounded p-1.5 border border-border font-medium">Risk Scoring</div>
                  <div className="bg-background rounded p-1.5 border border-border font-medium">Intent Routing</div>
                  <div className="bg-background rounded p-1.5 border border-border font-medium">Decision Making</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center text-primary/50">
                <div className="h-0.5 w-16 bg-primary/50 relative">
                  <div className="absolute right-0 -top-1.5 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary/50"></div>
                </div>
              </div>

              {/* Outputs */}
              <div className="flex flex-col gap-4 w-full md:w-1/4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg shadow-sm text-center text-emerald-700 dark:text-emerald-400">
                  <div className="font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Auto-Approvals
                  </div>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-lg shadow-sm text-center text-rose-700 dark:text-rose-400">
                  <div className="font-semibold text-sm flex items-center justify-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Account Freezes
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg shadow-sm text-center text-blue-700 dark:text-blue-400">
                  <div className="font-semibold text-sm flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" /> Audit Logging
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-foreground mb-3">Implementation Details</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Unified Model Strategy:</strong> Instead of managing multiple API endpoints, we use a single instance of `LLaMA-3.1-8B-Instant` via the Groq SDK, achieving ~1.5s average latency.</li>
                <li><strong>Dynamic Context Injection:</strong> On every request, the AI Core queries the live SQLite database to inject up-to-date transaction amounts, ticket histories, and customer profiles into its prompt.</li>
                <li><strong>Autonomous Execution:</strong> The core not only recommends actions but actively executes SQL `UPDATE` statements to freeze accounts or approve refunds, immediately creating immutable `audit_logs`.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
      
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
