import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Mail, Phone, CalendarDays, MoreHorizontal } from 'lucide-react';
import { apiClient } from '@/api/client';

export function Customers() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/customers');
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            Add Customer
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or email..."
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
                <th className="px-6 py-3 font-medium">Customer ID</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Joined Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center">No customers found</td></tr>
              ) : (
                customers?.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">CST-{customer.id.toString().padStart(4, '0')}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        {customer.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {customer.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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
