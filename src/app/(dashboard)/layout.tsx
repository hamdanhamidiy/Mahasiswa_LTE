'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Anchor } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, setUser, sidebarOpen } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      // 1. First check if we have a valid Supabase session
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // No session — redirect to login
        setLoading(false);
        router.replace('/login');
        return;
      }

      // 2. Fetch user profile from API
      const res = await fetch('/api/data?type=user', { credentials: 'include' });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      if (data) {
        setUser(data);
      } else {
        throw new Error('User profile not found in database');
      }
    } catch (err: any) {
      console.error('Dashboard loadUser error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [setUser, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Redirect to login if not authenticated (after loading finished, no user, no error)
  useEffect(() => {
    if (!loading && !user && !error) {
      const signOutAndRedirect = async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        router.replace('/login');
      };
      signOutAndRedirect();
    }
  }, [loading, user, error, router]);

  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDuration: '1.2s' }} />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Anchor className="w-6 h-6 text-primary/60" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight">LTE Cruise AIS</p>
            <p className="text-xs text-muted-foreground mt-0.5">Memuat data...</p>
          </div>
          <div className="w-28 mx-auto h-0.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary/50 rounded-full animate-progress" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="mx-auto w-14 h-14 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <Anchor className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight">Gagal Memuat Data</p>
            <p className="text-xs text-muted-foreground mt-1 break-all">{error}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { setError(null); setLoading(true); loadUser(); }}
              className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.replace('/login');
              }}
              className="px-4 py-2 text-xs font-semibold bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Kembali ke Login
            </button>
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
          avatarUrl={user.avatar_url}
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

