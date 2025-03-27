import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      // For development, let's auto-authenticate
      const mockUser: User = {
        id: '1',
        email: 'demo@example.com',
        role: 'investigator',
        name: 'Demo User',
      };
      set({ user: mockUser, isAuthenticated: true });
    } catch (error) {
      set({ error: 'Failed to initialize auth state' });
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Implement Firebase authentication here
      const mockUser: User = {
        id: '1',
        email,
        role: 'investigator',
        name: 'John Doe',
      };
      set({ user: mockUser, isAuthenticated: true });
    } catch (error) {
      set({ error: 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Implement Firebase logout here
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: 'Logout failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));