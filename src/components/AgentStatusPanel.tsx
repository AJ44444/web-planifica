import React, { useState } from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  Video, 
  MessageSquare,
  Compass,
  History,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AgentStatusPanelProps } from '../types';

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ activeTab, onSelectTab }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <aside className={`agent-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Compass size={18} color="#1d4ed8" />
          <span className="nav-label">Workspace</span>
        </div>
        <button
          type="button"
          className="btn-toggle-menu"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Desplegar menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => onSelectTab('chat')}
          title="Chat Interactivo"
        >
          <MessageSquare size={18} />
          <span className="nav-label">Chat</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'planifications' ? 'active' : ''}`}
          onClick={() => onSelectTab('planifications')}
          title="Planificaciones"
        >
          <Layers size={18} />
          <span className="nav-label">Planificaciones</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => onSelectTab('plan')}
          title="Visualizador de Plan"
        >
          <BookOpen size={18} />
          <span className="nav-label">Visualizador de Plan</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'rubric' ? 'active' : ''}`}
          onClick={() => onSelectTab('rubric')}
          title="Rúbricas & Cotejo"
        >
          <ClipboardCheck size={18} />
          <span className="nav-label">Rúbricas & Cotejo</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'multimodal' ? 'active' : ''}`}
          onClick={() => onSelectTab('multimodal')}
          title="Recursos Multimodales"
        >
          <Video size={18} />
          <span className="nav-label">Recursos Multimodales</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onSelectTab('history')}
          title="Historial de Conversaciones"
        >
          <History size={18} />
          <span className="nav-label">Historial</span>
        </button>
      </nav>

      <style>{`
        .agent-sidebar {
          width: 260px;
          min-width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.15rem 0.85rem;
          gap: 1rem;
          overflow-y: auto;
          box-shadow: 2px 0 12px rgba(29, 78, 216, 0.03);
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s ease;
        }

        .agent-sidebar.collapsed {
          width: 64px;
          min-width: 64px;
          padding: 1.15rem 0.4rem;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .agent-sidebar.collapsed .sidebar-header {
          justify-content: center;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .btn-toggle-menu {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          border-radius: 0.4rem;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-toggle-menu:hover {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #1d4ed8;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
          font-weight: 600;
        }

        .agent-sidebar.collapsed .sidebar-title {
          display: none !important;
        }

        .agent-sidebar.collapsed .nav-label {
          display: none;
        }

        .agent-sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 0.65rem 0.25rem;
        }

        /* Responsive Breakpoint: Mobile & Tablet */
        @media (max-width: 900px) {
          .agent-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};
