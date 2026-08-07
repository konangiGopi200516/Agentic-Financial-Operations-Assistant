import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Ticket, 
  Bot, 
  RefreshCcw, 
  ShieldAlert, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Tickets', path: '/tickets', icon: Ticket },
  { name: 'Payment Agent', path: '/payment-agent', icon: Bot },
  { name: 'Fraud Detection', path: '/fraud', icon: ShieldAlert },
  { name: 'Human Approval', path: '/approvals', icon: CheckSquare },
  { name: 'Audit Logs', path: '/audit', icon: FileText },
  { name: 'AI Agents', path: '/agents', icon: Bot },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
          <Bot className="h-6 w-6 text-blue-500" />
          FinPilot <span className="text-blue-500">AI</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-blue-500" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-border p-4">
        <button
          onClick={() => {
            localStorage.removeItem('finpilot_token');
            window.location.href = '/';
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
