import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title = 'Aviso',
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-card">
        <div className="error-modal-header">
          <div className="error-modal-icon-badge">
            <AlertCircle size={22} color="#dc2626" />
          </div>
          <h3 className="error-modal-title">{title}</h3>
        </div>

        <div className="error-modal-body">
          <p className="error-modal-message">{message}</p>
        </div>

        <div className="error-modal-footer">
          <button className="error-modal-confirm-btn" onClick={onClose}>
            Entendido
          </button>
        </div>

        <style>{`
          .error-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(4px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            animation: fadeIn 0.15s ease-out;
          }

          .error-modal-card {
            background: #ffffff;
            border-radius: 0.85rem;
            border: 1px solid #e2e8f0;
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
            width: 100%;
            max-width: 440px;
            overflow: hidden;
            animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .error-modal-header {
            padding: 1.15rem 1.25rem 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-bottom: 1px solid #f1f5f9;
            position: relative;
          }

          .error-modal-icon-badge {
            width: 38px;
            height: 38px;
            border-radius: 0.5rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .error-modal-title {
            font-family: var(--font-heading);
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            flex: 1;
          }

          .error-modal-body {
            padding: 1.15rem 1.25rem;
          }

          .error-modal-message {
            font-size: 0.925rem;
            color: #334155;
            line-height: 1.55;
            margin: 0;
          }

          .error-modal-footer {
            padding: 0.85rem 1.25rem 1.15rem;
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: flex-end;
          }

          .error-modal-confirm-btn {
            background: #1d4ed8;
            color: #ffffff;
            border: none;
            padding: 0.5rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
          }

          .error-modal-confirm-btn:hover {
            background: #1e40af;
            box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};
