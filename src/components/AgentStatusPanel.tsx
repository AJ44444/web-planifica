import React from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  Video, 
  MessageSquare,
  Compass,
  History
} from 'lucide-react';

interface AgentStatusPanelProps {
  activeTab: 'chat' | 'plan' | 'rubric' | 'multimodal' | 'history';
  onSelectTab: (tab: 'chat' | 'plan' | 'rubric' | 'multimodal' | 'history') => void;
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="agent-sidebar">
      {/* Quick Navigation Workspace Tabs */}
      <div className="sidebar-section">
        <h4 className="sidebar-title">
          <Compass size={16} color="#1d4ed8" />
          <span>Workspace</span>
        </h4>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => onSelectTab('chat')}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => onSelectTab('plan')}
          >
            <BookOpen size={16} />
            <span>Visualizador de Plan</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'rubric' ? 'active' : ''}`}
            onClick={() => onSelectTab('rubric')}
          >
            <ClipboardCheck size={16} />
            <span>Rúbricas & Cotejo</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'multimodal' ? 'active' : ''}`}
            onClick={() => onSelectTab('multimodal')}
          >
            <Video size={16} />
            <span>Recursos Multimodales</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onSelectTab('history')}
          >
            <History size={16} />
            <span>Historial</span>
          </button>
        </nav>
      </div>

      <style>{`
        .agent-sidebar {
          width: 260px;
          min-width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1rem;
          gap: 1rem;
          overflow-y: auto;
          box-shadow: 2px 0 12px rgba(29, 78, 216, 0.03);
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
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
      `}</style>
    </aside>
  );
};
