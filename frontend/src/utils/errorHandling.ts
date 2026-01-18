import { notifications } from '@mantine/notifications';

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: any, fallback = 'An error occurred'): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return fallback;
};

/**
 * Show error notification with consistent formatting
 */
export const showError = (error: any, fallback = 'An error occurred') => {
    const message = getErrorMessage(error, fallback);
    notifications.show({
        title: 'Error',
        message,
        color: 'red',
    });
};

/**
 * Show success notification with consistent formatting
 */
export const showSuccess = (message: string, title = 'Success') => {
    notifications.show({
        title,
        message,
        color: 'green',
    });
};
