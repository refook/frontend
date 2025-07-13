import { useState, useCallback } from 'react';
import type { NotificationProps } from '../components/Notification';

interface NotificationState {
  show: boolean;
  type: NotificationProps['type'];
  title: string;
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = useCallback((
    type: NotificationProps['type'],
    title: string,
    message: string,
    duration?: number
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });

    // Автоматически скрываем уведомление через указанное время
    if (duration !== undefined && duration > 0) {
      setTimeout(() => {
        hideNotification();
      }, duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showNotification('success', title, message, duration);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    showNotification('error', title, message, duration);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showNotification('warning', title, message, duration);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showNotification('info', title, message, duration);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}; 