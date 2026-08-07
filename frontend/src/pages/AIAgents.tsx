import React from 'react';
import { Bot, CheckCircle2, Clock, Activity, Cpu } from 'lucide-react';

const agents = [
  { name: 'Ticket Agent', status: 'Running', currentTask: 'Analyzing TKT-1045', accuracy: 96, avgTime: '2.4s', processed: 1405 },
  { name: 'Payment Agent', status: 'Idle', currentTask: 'Waiting in queue...', accuracy: 99, avgTime: '1.2s', processed: 8402 },
  { name: 'Fraud Agent', status: 'Running', currentTask: 'Scanning TXN-9022', accuracy: 91, avgTime: '4.5s', processed: 9230 },
  { name: 'Approval Agent', status: 'Waiting', currentTask: 'Blocked on Manager input (RFND-55)', accuracy: 100, avgTime: '0.8s', processed: 210 },
  { name: 'Audit Agent', status: 'Logging', currentTask: 'Writing log #4521', accuracy: 100, avgTime: '0.1s', processed: 18450 },
];

export function AIAgents() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">AI Agent Monitor</h1>
        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-md text-sm font-semibold border border-emerald-200 dark:border-emerald-500/30">
          <Activity className="h-4 w-4" /> System Healthy
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.name} className="rounded-xl border border-border bg-card shadow-sm p-6 glass-card relative overflow-hidden">
            {agent.status === 'Running' && (
              <div className="absolute top-0 right-0 h-1 w-full bg-primary/20">
                <div className="h-full bg-primary w-1/3 animate-[slide_2s_ease-in-out_infinite]"></div>
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                  agent.status === 'Running' || agent.status === 'Logging' ? 'bg-primary/20 text-primary' : 
                  agent.status === 'Waiting' ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'
                }`}>
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold mt-0.5">
                    {agent.status === 'Running' || agent.status === 'Logging' ? (
                      <span className="text-emerald-500 flex items-center gap-1"><Cpu className="h-3 w-3 animate-pulse" /> {agent.status}</span>
                    ) : agent.status === 'Waiting' ? (
                      <span className="text-amber-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {agent.status}</span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {agent.status}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-md p-3 mb-4 border border-border text-sm flex items-center gap-2 font-mono text-muted-foreground">
              <span className="text-primary font-bold">{">"}</span> {agent.currentTask}
              {agent.status === 'Running' && <span className="animate-pulse">_</span>}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                <div className="font-semibold text-foreground">{agent.accuracy}%</div>
              </div>
              <div className="border-l border-border">
                <div className="text-xs text-muted-foreground mb-1">Avg Time</div>
                <div className="font-semibold text-foreground">{agent.avgTime}</div>
              </div>
              <div className="border-l border-border">
                <div className="text-xs text-muted-foreground mb-1">Processed</div>
                <div className="font-semibold text-foreground">{(agent.processed / 1000).toFixed(1)}k</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
