import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Search, UserCircle } from 'lucide-react';
import { AIAssistant } from '@/components/AIAssistant';

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search transactions, tickets..."
                className="h-9 w-64 md:w-96 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <AIAssistant />
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <UserCircle className="h-6 w-6 text-foreground" />
              <span className="text-sm font-medium text-foreground hidden md:inline-block">Admin User</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
