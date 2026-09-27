import React from 'react';
import { useLangGraph } from '../context/LangGraphContext';
import { Info, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notificationBanner, closeNotificationBanner } = useLangGraph();

  if (!notificationBanner) return null;

  const { message } = notificationBanner;

  return (
    <div className="top-notification-banner">
      <div className="banner-container">
        <div className="banner-content">
          <Info size={16} className="banner-icon" />
          <span className="banner-message">{message}</span>
        </div>

        <button
          type="button"
          className="banner-close-btn"
          onClick={closeNotificationBanner}
          title="Cerrar notificación"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
