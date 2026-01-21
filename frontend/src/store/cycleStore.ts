import { create } from 'zustand';

export interface Cycle {
  _id: string;
  userId: string;
  niddahOnah: {
    start: string;
    end: string;
  };
  hefsekTaharaDate?: string;
  shivaNekiyimStartDate?: string;
  mikvahDate?: string;
  status: 'niddah' | 'shiva_nekiyim' | 'completed';
  cycleLength?: number;
  haflagah?: number;
  vestOnot?: {
    vesetHachodesh?: {
      start: string;
      end: string;
      ohrZaruah?: {
        start: string;
        end: string;
      };
      hebrewDate?: string;
      dayOfWeek?: number;
    };
    haflagah?: {
      start: string;
      end: string;
      ohrZaruah?: {
        start: string;
        end: string;
      };
      interval?: number;
      hebrewDate?: string;
      dayOfWeek?: number;
    };
    onahBeinonit?: {
      start: string;
      end: string;
      ohrZaruah?: {
        start: string;
        end: string;
      };
      kreisiUpleisi?: {
        start: string;
        end: string;
      };
      chasamSofer?: {
        start: string;
        end: string;
      };
      calculatedFrom?: number;
      hebrewDate?: string;
      dayOfWeek?: number;
    };
  };
  appliedChumras?: {
    ohrZaruah: boolean;
    kreisiUpleisi: boolean;
    chasamSofer: boolean;
  };
  bedikot?: any[];
  notes?: string;
  privateNotes?: string;
  calculatedInTimezone: string;
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
      cycles: state.cycles.map((cycle) => (cycle._id === id ? { ...cycle, ...updates } : cycle)),
    })),
  deleteCycle: (id) =>
    set((state) => ({
      cycles: state.cycles.filter((cycle) => cycle._id !== id),
    })),
  triggerRefetch: () => set((state) => ({ refetchFlag: !state.refetchFlag })),
  clearCycles: () => set({ cycles: [], refetchFlag: false }),
}));
