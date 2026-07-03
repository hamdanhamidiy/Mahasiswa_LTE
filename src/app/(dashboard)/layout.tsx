'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Anchor } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, setUser, sidebarOpen } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchData<User>('user');
      if (data) setUser(data);
      setLoading(false);
    };
    loadUser();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-5 animate-fade-in">
          <div className="relative mx-auto w-16 h-16">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse" />
            {/* Spinning border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-primary/30 animate-spin" style={{ animationDuration: '1.5s' }} />
            {/* Icon */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Anchor className="w-7 h-7 text-primary/60" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground tracking-tight">LTE Cruise AIS</p>
            <p className="text-xs text-muted-foreground mt-1">Memuat data...</p>
          </div>
          {/* Loading bar */}
          <div className="w-32 mx-auto h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full animate-progress" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <Sidebar
          role={user.role}
          userName={user.nama_lengkap}
          userNim={user.nim}
        />
      )}
      <div
        className={cn(
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col min-h-screen',
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[70px]'
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Institutional Footer */}
        <footer className="institutional-footer px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © {new Date().getFullYear()} LTE Cruise — Leading Tourism Education
            </p>
            <p className="text-muted-foreground/50">
              Jl. Pancawarna, Perumahan Oasis Cluster, Tulungrejo, Pare, Kab. Kediri
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
