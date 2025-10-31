import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default ToastContainer;

