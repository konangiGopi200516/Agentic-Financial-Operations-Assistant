import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, CheckCircle2, Ticket } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, action?: any}[]>([
    { role: 'ai', content: 'Hello! I am your FinPilot AI Assistant.\n\nYou can ask me things like:\n• "Add failed transactions to tickets"\n• "How many pending refunds are there?"\n• "Show me recent fraud alerts"' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await apiClient.post('/ai/chat', { message: userMessage });

      // If the bot performed an action (like creating tickets), refresh relevant queries
      if (data.action?.type === 'tickets_created') {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.reply, action: data.action }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the brain right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative z-50 flex items-center justify-center">
      {isOpen ? (
        <div className="absolute right-0 top-12 bg-card border border-border shadow-2xl rounded-2xl w-[380px] flex flex-col h-[520px] animate-in zoom-in-95 origin-top-right">
          {/* Header */}
          <div className="bg-primary p-4 rounded-t-2xl flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <span className="font-bold block leading-tight">FinPilot Bot</span>
                <span className="text-xs opacity-75">AI-Powered · Can take actions</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary/90 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm border border-border'}`}>
                  {msg.content}
                </div>
                {/* Action result card */}
                {msg.action?.type === 'tickets_created' && (
                  <div className="w-full max-w-[90%] rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5 font-semibold mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {msg.action.count} Ticket{msg.action.count !== 1 ? 's' : ''} Created
                    </div>
                    <div className="flex flex-col gap-1">
                      {msg.action.tickets.map((t: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Ticket className="h-3 w-3 opacity-60" />
                          {t}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] opacity-60">Tickets page has been refreshed automatically.</div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground border border-border max-w-[85%] rounded-2xl rounded-tl-sm p-3 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. Add failed transactions to tickets..."
                className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative hover:text-foreground text-muted-foreground transition-colors p-2"
        >
          <Bot className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
        </button>
      )}
    </div>
  );
}
