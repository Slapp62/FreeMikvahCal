import { notifications } from '@mantine/notifications';

/**
 * Map of common error patterns to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
    // Network errors
    'Network Error': 'Cannot connect to the server. Please check your internet connection and try again.',
    'Request failed': 'Failed to communicate with the server. Please try again.',

    // Authentication errors
    'Unauthorized': 'Your session has expired. Please log in again.',
    'Invalid token': 'Your session has expired. Please log in again.',

    // Validation errors - these come from backend
    'Validation error': 'Please check your input and try again.',
    'Location not set': 'Please set your location in Settings before creating events.',
    'Complete location': 'Please set your complete location (city, timezone) in Settings.',

    // Cycle-specific errors (handled by backend messages)
    'already exists for this time': 'A period entry already exists for this date. Please delete the existing one first or choose a different date.',
    'at least': 'minimum', // Will be handled by backend message
    'cannot be before': 'invalid date order', // Will be handled by backend message
};

/**
 * Extract error message from various error formats and enhance with user-friendly text
 */
export const getErrorMessage = (error: any, fallback = 'An error occurred'): string => {
    let message = fallback;

    // Try to get the error message from response
    if (error.response?.data?.message) {
        message = error.response.data.message;
    } else if (error.response?.data?.errors) {
        // Handle validation errors array (from Joi)
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
            message = errors.map((e: any) => e.message || e).join('. ');
        }
    } else if (error.message) {
        message = error.message;
    }

    // Check if we have a friendlier version
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGE_MAP)) {
        if (message.toLowerCase().includes(pattern.toLowerCase())) {
            // If the backend message is already descriptive, use it
            // Otherwise use our friendly message
            if (message.length < 50) {
                return friendlyMessage;
            }
            // Backend message is detailed enough, return it as-is
            return message;
        }
    }

    return message;
};

/**
 * Extract validation field errors for form display
 */
export const getValidationErrors = (error: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
            if (err.field && err.message) {
                errors[err.field] = err.message;
            }
        });
    }

    return errors;
};

/**
 * Show error notification with consistent formatting
 */
export const showError = (error: any, fallback = 'An error occurred') => {
    const message = getErrorMessage(error, fallback);

    // Determine appropriate title based on error type
    let title = 'Error';
    if (error.response?.status === 400) {
        title = 'Validation Error';
    } else if (error.response?.status === 401 || error.response?.status === 403) {
        title = 'Authentication Error';
    } else if (error.response?.status === 404) {
        title = 'Not Found';
    } else if (error.response?.status >= 500) {
        title = 'Server Error';
    }

    notifications.show({
        title,
        message,
        color: 'red',
        autoClose: 7000, // Keep errors visible longer
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
        autoClose: 4000,
    });
};

/**
 * Show warning notification
 */
export const showWarning = (message: string, title = 'Warning') => {
    notifications.show({
        title,
        message,
        color: 'yellow',
        autoClose: 5000,
    });
};

/**
 * Show info notification
 */
export const showInfo = (message: string, title = 'Info') => {
    notifications.show({
        title,
        message,
        color: 'blue',
        autoClose: 4000,
    });
};
