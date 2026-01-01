
import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]); // {id,title,message,type,duration,action}

  const showNotification = useCallback((message, type = 'info', options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast = {
      id,
      title: options.title,
      message,
      type,
      duration: options.duration ?? 3000,
      action: options.action, // {label,onClick}
    };
    setNotifications(prev => [toast, ...prev].slice(0, 5)); // keep last 5
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    if (!id) {
      setNotifications(prev => prev.slice(1));
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return { notifications, showNotification, hideNotification, clearNotifications };
};
