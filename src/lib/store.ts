import { create } from 'zustand';
import type { User, Notification } from '@/lib/types';

interface AppState {
  user: User | null;
  notifications: Notification[];
  unreadCount: number;
  sidebarOpen: boolean;

  setUser: (user: User | null) => void;
  updateAvatarUrl: (url: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  notifications: [],
  unreadCount: 0,
  sidebarOpen: true,

  setUser: (user) => set({ user }),

  updateAvatarUrl: (url) => set((state) => ({
    user: state.user ? { ...state.user, avatar_url: url } : null,
  })),

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
