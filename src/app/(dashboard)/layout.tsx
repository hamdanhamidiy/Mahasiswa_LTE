'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
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

  // Redirect to login if not authenticated
  // Sign out first to clear any stale session and prevent redirect loop with middleware
  useEffect(() => {
    if (!loading && !user) {
      const signOutAndRedirect = async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // ignore sign-out errors
        }
        window.location.href = '/login';
      };
      signOutAndRedirect();
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          {/* Logo spinner */}
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDuration: '1.2s' }} />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Anchor className="w-6 h-6 text-primary/60" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight">LTE Cruise AIS</p>
            <p className="text-xs text-muted-foreground mt-0.5">{!loading && !user ? 'Mengarahkan ke halaman login...' : 'Memuat data...'}</p>
          </div>
          {/* Loading bar */}
          <div className="w-28 mx-auto h-0.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary/50 rounded-full animate-progress" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
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
          sidebarOpen ? 'lg:ml-[256px]' : 'lg:ml-[68px]'
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-7">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border px-4 sm:px-6 lg:px-8 py-4 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
            <p>© {new Date().getFullYear()} LTE Cruise — Leading Tourism Education</p>
            <p className="text-muted-foreground/50">Kampung Inggris, Pare, Kediri</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
