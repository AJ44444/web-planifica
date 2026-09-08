import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLangGraph } from '../context/LangGraphContext';
import { 
  BookOpen, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Menu, 
  X,
  MessageSquare,
  Layers,
  ClipboardCheck,
  Video,
  History
} from 'lucide-react';
import type { ViewTabType } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    isServerOnline, 
    threads, 
    currentThreadId, 
    selectThread, 
    createNewThread,
    activeViewTab,
    setActiveViewTab
  } = useLangGraph();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleSelectTab = (tab: ViewTabType) => {
    setActiveViewTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="btn-hamburger-menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          title={isMobileMenuOpen ? 'Cerrar menú' : 'Desplegar menú'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="brand-logo">
          <div className="logo-icon">
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div className="logo-text">
            <span className="brand-title">Planifica</span>
          </div>
        </div>

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
        {user && (
          <div className="user-profile-chip">
            <div className="user-avatar-fallback">
              {(user.nombres).slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.nombres}</span>
            </div>
            <button className="btn-icon-logout" onClick={logout} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <nav className="mobile-nav-list">
            <button
              className={`mobile-nav-item ${activeViewTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleSelectTab('chat')}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'planifications' ? 'active' : ''}`}
              onClick={() => handleSelectTab('planifications')}
            >
              <Layers size={18} />
              <span>Planificaciones</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'plan' ? 'active' : ''}`}
              onClick={() => handleSelectTab('plan')}
            >
              <BookOpen size={18} />
              <span>Planificación</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'rubric' ? 'active' : ''}`}
              onClick={() => handleSelectTab('rubric')}
            >
              <ClipboardCheck size={18} />
              <span>Herramientas de Evaluación</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'multimodal' ? 'active' : ''}`}
              onClick={() => handleSelectTab('multimodal')}
            >
              <Video size={18} />
              <span>Recursos Multimodales</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'history' ? 'active' : ''}`}
              onClick={() => handleSelectTab('history')}
            >
              <History size={18} />
              <span>Historial</span>
            </button>
          </nav>
        </div>
      )}

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
          position: relative;
          z-index: 40;
        }

        .navbar-left, .navbar-center, .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-hamburger-menu {
          display: none;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          border-radius: 0.5rem;
          padding: 0.4rem;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-hamburger-menu:hover {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .mobile-menu-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border-bottom: 1px solid #cbd5e1;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
          z-index: 99;
          padding: 0.75rem 1rem;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .mobile-nav-item:hover {
          background: #f8fafc;
          color: #1d4ed8;
        }

        .mobile-nav-item.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
          font-weight: 600;
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
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
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

          .btn-hamburger-menu {
            display: inline-flex !important;
          }

          .navbar-left, .navbar-right {
            gap: 0.4rem;
          }

          .navbar-center, .thread-selector-container {
            display: none !important;
          }

          .brand-logo {
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
        }
      `}</style>
    </header>
  );
};
