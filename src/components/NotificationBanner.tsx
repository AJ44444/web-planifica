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

      <style>{`
        .top-notification-banner {
          width: 100%;
          background: #eff6ff;
          color: #1d4ed8;
          border-bottom: 1px solid #bfdbfe;
          font-family: var(--font-heading, inherit);
          font-size: 0.85rem;
          line-height: 1.4;
          animation: slideDownBanner 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(29, 78, 216, 0.06);
          flex-shrink: 0;
        }

        @keyframes slideDownBanner {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .banner-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.5rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          min-width: 0;
        }

        .banner-icon {
          flex-shrink: 0;
          color: #1d4ed8;
        }

        .banner-message {
          font-weight: 600;
          color: #1e40af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .banner-close-btn {
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          border-radius: 0.35rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .banner-close-btn:hover {
          background: #bfdbfe;
          color: #1e40af;
          transform: scale(1.05);
        }

        @media (max-width: 640px) {
          .banner-container {
            padding: 0.45rem 0.85rem;
          }
          .banner-message {
            font-size: 0.8rem;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
};
