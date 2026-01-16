import { create } from 'zustand';

export interface Cycle {
  _id: string;
  userId: string;
  periodStart: string;
  hefsekTahara?: string;
  shivaNekiyimStart?: string;
  mikvahDate?: string;
  periodEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CycleState {
  cycles: Cycle[];
  refetchFlag: boolean;
  setCycles: (cycles: Cycle[]) => void;
  addCycle: (cycle: Cycle) => void;
  updateCycle: (id: string, updates: Partial<Cycle>) => void;
  deleteCycle: (id: string) => void;
  triggerRefetch: () => void;
  clearCycles: () => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  refetchFlag: false,
  setCycles: (cycles) => set({ cycles }),
  addCycle: (cycle) => set((state) => ({ cycles: [...state.cycles, cycle] })),
  updateCycle: (id, updates) =>
    set((state) => ({
      cycles: state.cycles.map((cycle) =>
        cycle._id === id ? { ...cycle, ...updates } : cycle
      ),
    })),
  deleteCycle: (id) =>
    set((state) => ({
      cycles: state.cycles.filter((cycle) => cycle._id !== id),
    })),
  triggerRefetch: () => set((state) => ({ refetchFlag: !state.refetchFlag })),
  clearCycles: () => set({ cycles: [], refetchFlag: false }),
}));
