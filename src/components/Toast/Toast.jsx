import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import './Toast.css';

const Toast = ({ notification }) => {
  const { removeNotification } = useNotification();

  const handleClose = () => {
    removeNotification(notification.id);
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className={`toast toast-${notification.type}`} onClick={handleClose}>
      <div className="toast-icon">
        {icons[notification.type] || <Info size={20} />}
      </div>
      <div className="toast-content">
        <p className="toast-message">{notification.message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;

