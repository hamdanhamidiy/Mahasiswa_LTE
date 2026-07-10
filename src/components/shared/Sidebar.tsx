'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard, User, Calendar, ClipboardCheck, GraduationCap,
  Briefcase, CreditCard, Award, Users, Megaphone, Settings, BarChart3,
  FileText, UserCheck, ChevronLeft, ChevronRight, LogOut, X,
  Wallet, BookOpen, Building2, Anchor, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: string }
interface NavGroup { title: string; items: NavItem[] }

const navGroupsByRole: Record<UserRole, NavGroup[]> = {
  mahasiswa: [
    {
      title: 'Utama',
      items: [
        { label: 'Dashboard', href: '/mahasiswa/dashboard', icon: LayoutDashboard },
        { label: 'Profil Saya', href: '/mahasiswa/profil', icon: User },
      ],
    },
    {
      title: 'Akademik',
      items: [
        { label: 'Jadwal Kuliah', href: '/mahasiswa/jadwal', icon: Calendar },
        { label: 'Absensi', href: '/mahasiswa/absensi', icon: ClipboardCheck },
        { label: 'Nilai Akademik', href: '/mahasiswa/nilai', icon: GraduationCap },
        { label: 'Transkrip Nilai', href: '/mahasiswa/transkrip', icon: FileText },
      ],
    },
    {
      title: 'Keuangan',
      items: [
        { label: 'Pembayaran', href: '/mahasiswa/pembayaran', icon: Wallet },
      ],
    },
    {
      title: 'Karir & OJT',
      items: [
        { label: 'OJT Tracker', href: '/mahasiswa/ojt', icon: Briefcase },
        { label: 'Mitra Kerja', href: '/mahasiswa/mitra-kerja', icon: Building2 },
        { label: 'Interview', href: '/mahasiswa/interview', icon: UserCheck },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        { label: 'KTM Digital', href: '/mahasiswa/ktm', icon: CreditCard },
        { label: 'Pengumuman', href: '/mahasiswa/pengumuman', icon: Megaphone },
      ],
    },
  ],
  instruktur: [
    {
      title: 'Utama',
      items: [
        { label: 'Dashboard', href: '/instruktur/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Akademik',
      items: [
        { label: 'Jadwal Mengajar', href: '/instruktur/jadwal', icon: Calendar },
        { label: 'Absensi', href: '/instruktur/absensi', icon: ClipboardCheck },
        { label: 'Input Nilai', href: '/instruktur/nilai', icon: GraduationCap },
      ],
    },
    {
      title: 'Karir',
      items: [
        { label: 'Mahasiswa OJT', href: '/instruktur/ojt', icon: Briefcase },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        { label: 'Pengumuman', href: '/instruktur/pengumuman', icon: Megaphone },
      ],
    },
  ],
  admin: [
    {
      title: 'Utama',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Data Akademik',
      items: [
        { label: 'Mahasiswa', href: '/admin/mahasiswa', icon: Users },
        { label: 'Instruktur', href: '/admin/instruktur', icon: User },
        { label: 'Mata Pelajaran', href: '/admin/mata-pelajaran', icon: BookOpen },
        { label: 'Jadwal', href: '/admin/jadwal', icon: Calendar },
        { label: 'Absensi', href: '/admin/absensi', icon: ClipboardCheck },
        { label: 'Nilai', href: '/admin/nilai', icon: GraduationCap },
      ],
    },
    {
      title: 'Keuangan',
      items: [
        { label: 'Pembayaran', href: '/admin/pembayaran', icon: Wallet },
      ],
    },
    {
      title: 'Karir & Alumni',
      items: [
        { label: 'OJT', href: '/admin/ojt', icon: Briefcase },
        { label: 'Mitra Kerja', href: '/admin/mitra-kerja', icon: Building2 },
        { label: 'Sertifikat', href: '/admin/sertifikat', icon: Award },
        { label: 'Alumni', href: '/admin/alumni', icon: UserCheck },
        { label: 'Interview', href: '/admin/interview', icon: Users },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        { label: 'Pengumuman', href: '/admin/pengumuman', icon: Megaphone },
        { label: 'KTM', href: '/admin/ktm', icon: CreditCard },
        { label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
      ],
    },
  ],
  headmaster: [
    {
      title: 'Utama',
      items: [
        { label: 'Dashboard', href: '/headmaster/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Analitik',
      items: [
        { label: 'Statistik', href: '/headmaster/statistik', icon: BarChart3 },
        { label: 'Alumni', href: '/headmaster/alumni', icon: UserCheck },
        { label: 'Laporan', href: '/headmaster/laporan', icon: FileText },
      ],
    },
  ],
};

interface SidebarProps { role: UserRole; userName: string; userNim?: string | null }

export function Sidebar({ role, userName, userNim }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setSidebarOpen]);

  const navGroups = navGroupsByRole[role];
  const roleLabels: Record<UserRole, string> = {
    mahasiswa: 'Mahasiswa', instruktur: 'Instruktur', admin: 'Administrator', headmaster: 'Direktur',
  };

  const initials = userName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const linkContent = (
      <Link
        href={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group relative',
          isActive
            ? 'bg-primary/8 text-primary font-semibold'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        )}
      >
        {/* Active indicator line */}
        <div className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300',
          isActive
            ? 'h-5 opacity-100 bg-primary'
            : 'h-0 opacity-0 bg-primary/40'
        )} />

        <item.icon className={cn(
          'w-4 h-4 shrink-0 transition-colors duration-200',
          isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
        )} />
        {sidebarOpen && <span className="truncate leading-none">{item.label}</span>}
        {item.badge && sidebarOpen && (
          <span className="ml-auto text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{item.badge}</span>
        )}
      </Link>
    );

    if (!sidebarOpen && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={item.href}
                className={cn(
                  'flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              />
            }
          >
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300',
              isActive ? 'h-5 opacity-100 bg-primary' : 'h-0 opacity-0 bg-primary/40'
            )} />
            <item.icon className={cn(
              'w-4 h-4 shrink-0 transition-colors duration-200',
              isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
            )} />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'bg-white border-r border-slate-200',
        sidebarOpen ? 'w-[256px]' : 'w-[68px]',
        isMobile && !sidebarOpen && '-translate-x-full pointer-events-none',
        isMobile && sidebarOpen && 'w-[272px] shadow-2xl shadow-black/10 pointer-events-auto'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-[60px] border-b border-slate-100 shrink-0">
            <Link href={`/${role}/dashboard`} className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:shadow-primary/20 transition-all">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <h1 className="text-[13px] font-bold tracking-tight text-slate-800 leading-none">LTE CRUISE</h1>
                  <p className="text-[8px] text-slate-400 tracking-[0.18em] font-semibold mt-1 leading-none">ACADEMIC INFO SYSTEM</p>
                </div>
              )}
            </Link>
            {sidebarOpen && (
              <button
                onClick={isMobile ? () => setSidebarOpen(false) : toggleSidebar}
                className="p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
              >
                {isMobile
                  ? <X className="w-4 h-4 text-slate-400" />
                  : <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                }
              </button>
            )}
            {!sidebarOpen && !isMobile && (
              <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                <PanelLeft className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>

          {/* User info */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold truncate text-slate-700 leading-tight">{userName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      {roleLabels[role]}
                    </span>
                    {userNim && <span className="text-[9px] text-slate-300 font-mono">· {userNim}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 py-2">
            <nav className="px-2.5 space-y-0.5">
              {navGroups.map((group, gi) => (
                <div key={gi}>
                  {sidebarOpen && gi > 0 && (
                    <div className="px-3 pt-4 pb-1.5">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.14em]">
                        {group.title}
                      </span>
                    </div>
                  )}
                  {!sidebarOpen && gi > 0 && (
                    <div className="my-2 mx-3 border-t border-slate-100" />
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => <NavLink key={item.href} item={item} />)}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 shrink-0">
            <Button
              variant="ghost"
              className={cn(
                'w-full text-slate-400 hover:text-red-500 hover:bg-red-50 text-[12px] h-9 transition-all duration-200 rounded-lg',
                sidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
              )}
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="ml-2.5">Keluar</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
