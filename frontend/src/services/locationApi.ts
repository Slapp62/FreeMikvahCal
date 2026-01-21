import axiosInstance from '../utils/axiosConfig';

export interface Location {
  id: number;
  geonameId: number;
  value: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  timezone: string;
}

/**
 * Search locations (no auth required)
 */
export const searchLocations = async (
  query?: string
): Promise<{ count: number; locations: Location[] }> => {
  const response = await axiosInstance.get('/locations/search', {
    params: query ? { q: query } : {},
  });
  return response.data;
};

export default {
  searchLocations,
};
