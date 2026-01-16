import axiosInstance from '../utils/axiosConfig';
import { Cycle } from '../store/cycleStore';

export interface CreateCycleData {
  dateString: string; // YYYY-MM-DD
  timeString: string; // HH:mm
  notes?: string;
  privateNotes?: string;
}

export interface UpdateCycleData {
  hefsekTaharaDate?: {
    dateString: string;
    timeString: string;
  };
  shivaNekiyimStartDate?: {
    dateString: string;
    timeString: string;
  };
  mikvahDate?: {
    dateString: string;
    timeString: string;
  };
  status?: 'niddah' | 'shiva_nekiyim' | 'completed';
  notes?: string;
  privateNotes?: string;
}

export interface CyclesResponse {
  count: number;
  cycles: Cycle[];
}

/**
 * Get all user cycles
 */
export const getCycles = async (params?: {
  limit?: number;
  skip?: number;
  status?: string;
}): Promise<CyclesResponse> => {
  const response = await axiosInstance.get<CyclesResponse>('/cycles', { params });
  return response.data;
};

/**
 * Create a new cycle
 */
export const createCycle = async (data: CreateCycleData): Promise<{ message: string; cycle: Cycle }> => {
  const response = await axiosInstance.post('/cycles', data);
  return response.data;
};

/**
 * Get a specific cycle
 */
export const getCycle = async (id: string): Promise<Cycle> => {
  const response = await axiosInstance.get<Cycle>(`/cycles/${id}`);
  return response.data;
};

/**
 * Update a cycle
 */
export const updateCycle = async (id: string, data: UpdateCycleData): Promise<{ message: string; cycle: Cycle }> => {
  const response = await axiosInstance.put(`/cycles/${id}`, data);
  return response.data;
};

/**
 * Delete a cycle
 */
export const deleteCycle = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/cycles/${id}`);
  return response.data;
};

/**
 * Get active cycle
 */
export const getActiveCycle = async (): Promise<Cycle | null> => {
  const response = await axiosInstance.get('/cycles/active');
  return response.data.cycle || response.data;
};

/**
 * Get upcoming vest onot
 */
export const getUpcomingVestOnot = async (days: number = 30): Promise<any[]> => {
  const response = await axiosInstance.get('/cycles/vest-onot/upcoming', {
    params: { days },
  });
  return response.data.vestOnot;
};

export default {
  getCycles,
  createCycle,
  getCycle,
  updateCycle,
  deleteCycle,
  getActiveCycle,
  getUpcomingVestOnot,
};
