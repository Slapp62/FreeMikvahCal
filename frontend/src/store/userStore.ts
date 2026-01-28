import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  googleId?: string;
  location?: {
    city?: string;
    state?: string;
    geonameId?: number;
    timezone: string;
    lat?: number;
    lng?: number;
  };
  halachicCustom?: 'ashkenazi' | 'sephardi' | 'chabad' | 'manual' | null;
  halachicPreferences?: {
    ohrZaruah?: boolean;
    kreisiUpleisi?: boolean;
    chasamSofer?: boolean;
    minimumNiddahDays?: number;
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
