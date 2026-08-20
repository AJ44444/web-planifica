import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLangGraph } from '../context/LangGraphContext';
import { BookOpen, Plus, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isServerOnline, threads, currentThreadId, selectThread, createNewThread } = useLangGraph();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand-logo">
          <div className="logo-icon">
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div className="logo-text">
            <span className="brand-title">Planifica</span>
            <span className="brand-subtitle">IA EDUCATIVA</span>
          </div>
        </div>

        {/* Server Connection Badge */}
        <div className={`server-status ${isServerOnline ? 'online' : 'offline'}`}>
          {isServerOnline ? (
            <>
              <CheckCircle2 size={14} />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Desconectado</span>
            </>
          )}
        </div>
      </div>

      <div className="navbar-center">
        {/* Thread Selector */}
        <div className="thread-selector-container">
          <select
            className="thread-select"
            value={currentThreadId || ''}
            onChange={(e) => selectThread(e.target.value)}
          >
            {threads.slice(0, 10).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={createNewThread} title="Nueva Conversación">
            <Plus size={16} />
            <span>Nueva</span>
          </button>
        </div>
      </div>

      <div className="navbar-right">
        {/* Teacher Profile */}

        {/* Teacher Profile */}
        {user && (
          <div className="user-profile-chip">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-fallback">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
            </div>
            <button className="btn-icon-logout" onClick={logout} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          height: 68px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          box-shadow: 0 2px 10px rgba(29, 78, 216, 0.04);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .navbar-left, .navbar-center, .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 700;
          color: #1d4ed8;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.1em;
        }

        .server-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .server-status.online {
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .server-status.offline {
          background-color: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .thread-selector-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 0.6rem;
          border: 1px solid #e2e8f0;
        }

        .thread-select {
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.875rem;
          color: #0f172a;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        .user-profile-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.35rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #2563eb;
        }

        .user-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1d4ed8;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .user-role-badge {
          font-size: 0.7rem;
          color: #2563eb;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .btn-icon-logout {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .btn-icon-logout:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        /* Mobile & Tablet Responsive Rules */
        @media (max-width: 900px) {
          .navbar {
            height: auto;
            min-height: 56px;
            padding: 0.5rem 0.75rem;
            gap: 0.4rem;
          }

          .navbar-left, .navbar-right {
            gap: 0.4rem;
          }

          .navbar-center, .thread-selector-container {
            display: none !important;
          }

          .brand-title, .brand-subtitle {
            display: none !important;
          }

          .server-status span {
            display: none;
          }

          .server-status {
            padding: 0.25rem 0.45rem;
          }

          .thread-select {
            max-width: 110px;
            font-size: 0.8rem;
          }

          .user-name {
            display: none;
          }

          .user-profile-chip {
            padding: 0.2rem 0.35rem;
            background: transparent;
            border: none;
          }

          .btn-icon-logout {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            background: #fee2e2 !important;
            color: #dc2626 !important;
            padding: 0.45rem;
            border-radius: 0.5rem;
            flex-shrink: 0;
          }

          .btn span {
            display: none;
          }

          .btn {
            padding: 0.45rem 0.6rem;
          }
        }
      `}</style>
    </header>
  );
};
