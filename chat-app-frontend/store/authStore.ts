import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  themePreference?: string;
  notificationsEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  updateUser: (updatedUser) => {
    set((state) => {
      if (!state.user) return {};
      const newUser = { ...state.user, ...updatedUser };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      return { user: newUser };
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = userStr ? JSON.parse(userStr) : null;
          if (user) {
            set({ user, token, isAuthenticated: true, isLoading: false });
            return;
          }
        } catch (e) {
          console.error('Failed to parse user from local storage', e);
        }
      }
    }
    set({ isLoading: false });
  }
}));
