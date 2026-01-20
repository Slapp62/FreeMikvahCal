import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  location?: {
    city?: string;
    timezone: string;
    lat?: number;
    lng?: number;
  };
  ethnicity?: 'ashkenazi' | 'sephardi' | 'teimani' | 'other' | null;
  halachicPreferences?: {
    ohrZaruah: boolean;
    kreisiUpleisi: boolean;
    chasamSofer: boolean;
  };
  profileComplete: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'user-storage',
    }
  )
);
