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
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          font-family: var(--font-heading, inherit);
          font-size: 0.85rem;
          line-height: 1.4;
          animation: slideDownBanner 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
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
        }

        .spin-icon {
          animation: bannerSpin 1s linear infinite;
        }

        @keyframes bannerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .banner-message {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .banner-subarea-chip {
          font-family: monospace;
          font-size: 0.725rem;
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 0.15rem 0.45rem;
          border-radius: 0.3rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .banner-close-btn {
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: currentColor;
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
          background: rgba(255, 255, 255, 0.32);
          transform: scale(1.05);
        }

        /* All notification banners use strictly blue color theme */
        .top-notification-banner,
        .banner-in_progress, 
        .banner-info,
        .banner-completed, 
        .banner-success,
        .banner-error,
        .banner-warning {
          background: linear-gradient(90deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%);
          color: #ffffff;
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
