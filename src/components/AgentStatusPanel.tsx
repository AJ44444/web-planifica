import React, { useState } from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  Video, 
  MessageSquare,
  History,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AgentStatusPanelProps } from '../types';

// ponytail: Memoize sidebar to avoid re-rendering while chat messages stream
export const AgentStatusPanel = React.memo<AgentStatusPanelProps>(({ activeTab, onSelectTab }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <aside className={`agent-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
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
          title="Planificación"
        >
          <BookOpen size={18} />
          <span className="nav-label">Planificación</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'rubric' ? 'active' : ''}`}
          onClick={() => onSelectTab('rubric')}
          title="Herramientas de Evaluación"
        >
          <ClipboardCheck size={18} />
          <span className="nav-label">Herramientas de Evaluación</span>
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
    </aside>
  );
});