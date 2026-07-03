'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export function Navbar() {
  const { user, notifications, unreadCount, sidebarOpen, setSidebarOpen, markNotificationRead } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const profileHref = user?.role ? `/${user.role}/profil` : '/mahasiswa/profil';

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Get current academic year
  const now = new Date();
  const academicYear = now.getMonth() >= 6
    ? `${now.getFullYear()}/${now.getFullYear() + 1}`
    : `${now.getFullYear() - 1}/${now.getFullYear()}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 hover:bg-muted transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-[18px] h-[18px]" />
          </Button>
          <Breadcrumb />
        </div>

        {/* Center — Search overlay */}
        {showSearch && (
          <div className="absolute inset-x-0 top-0 h-14 bg-card/95 backdrop-blur-2xl z-50 flex items-center px-4 sm:px-6 lg:px-8 animate-fade-in border-b border-border">
            <div className="relative flex-1 max-w-xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Cari menu, halaman, atau fitur..."
                className="pl-10 pr-10 h-10 text-sm border-primary/15 focus:border-primary bg-muted/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Real-time clock */}
          <div className="hidden lg:flex items-center mr-1 px-2.5 py-1 rounded-md text-[11px] text-muted-foreground font-medium tabular-nums">
            {currentTime}
          </div>

          {/* Academic year indicator */}
          <div className="hidden md:flex items-center mr-1 px-2.5 py-1 rounded-md bg-muted/60">
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">
              T.A. {academicYear}
            </span>
          </div>

          {/* Search button */}
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all" onClick={() => setShowSearch(true)}>
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all outline-none">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-primary text-[9px] text-white flex items-center justify-center font-bold animate-fade-in-scale shadow-sm shadow-primary/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between py-2.5">
                <span className="text-sm font-semibold">Notifikasi</span>
                {unreadCount > 0 && <Badge variant="outline" className="text-[10px] px-2 font-semibold">{unreadCount} baru</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2.5 text-muted-foreground/15" />
                  <p className="text-xs text-muted-foreground">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3.5 cursor-pointer" onClick={() => markNotificationRead(notif.id)}>
                    <div className="flex items-start gap-2.5 w-full">
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-[13px] leading-snug ${!notif.is_read ? 'font-semibold' : ''}`}>{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-border mx-1.5" />

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer outline-none">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/8 text-primary text-[11px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <span className="text-[13px] font-semibold block leading-tight">{user?.nama_lengkap?.split(' ').slice(0, 2).join(' ') || 'User'}</span>
                <span className="text-[11px] text-muted-foreground leading-tight capitalize">{user?.role || 'user'}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-2">
                  {user?.email || 'user@lte.ac.id'}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] cursor-pointer py-2" onClick={() => window.location.href = profileHref}>
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] text-destructive cursor-pointer py-2" onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}>
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
