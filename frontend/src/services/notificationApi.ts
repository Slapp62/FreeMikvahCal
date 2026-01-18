import axiosInstance from '../utils/axiosConfig';

export interface Notification {
  _id: string;
  userId: string;
  type: 'hefsek_tahara' | 'shiva_nekiyim' | 'mikvah' | 'vest_onah';
  title: string;
  message: string;
  dueDate: string;
  status: 'pending' | 'sent' | 'dismissed';
  cycleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  count: number;
  notifications: Notification[];
}

/**
 * Get all notifications
 */
export const getNotifications = async (params?: {
  limit?: number;
  skip?: number;
}): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>('/notifications', { params });
  return response.data;
};

/**
 * Get pending notifications
 */
export const getPendingNotifications = async (): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>('/notifications/pending');
  return response.data;
};

export default {
  getNotifications,
  getPendingNotifications,
};
