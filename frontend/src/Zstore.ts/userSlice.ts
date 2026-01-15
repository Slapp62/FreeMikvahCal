import { StateCreator } from 'zustand'

export interface UserSlice {
  user: Object | null
  setUser: (user: Object) => void
  clearUser: () => void
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user: Object) => set({ user }),
  clearUser: () => set({ user: null }),
})
