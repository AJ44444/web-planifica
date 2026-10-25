import React from 'react';
import { useLangGraph } from '../../context/LangGraphContext';
import { History, MessageSquare, Trash2, Plus, Clock, MessageCircle } from 'lucide-react';

export const ThreadHistoryView: React.FC = () => {
  const { 
    threads, 
    currentThreadId, 
    selectThread, 
    createNewThread, 
    deleteThreadById, 
    setActiveViewTab 
  } = useLangGraph();

  const handleOpenThread = async (threadId: string) => {
    await selectThread(threadId);
    setActiveViewTab('chat');
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que deseas eliminar la ${title}?`)) {
      await deleteThreadById(threadId);
    }
  };

  return (
    <div className="history-visualizer-container">
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <History size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 className="visualizer-title">Historial de Conversaciones</h2>
            <p className="visualizer-subtitle">
              Visualización de todas las conversaciones creadas
            </p>
          </div>
        </div>
        <button className="btn-new-thread-action" onClick={createNewThread}>
          <Plus size={16} /> Nueva Conversación
        </button>
      </div>

      <div className="history-content-section">
        <div className="history-stats-bar">
          <span className="stats-badge">
            Total de Conversaciones: <strong>{threads.length}</strong>
          </span>
          {currentThreadId && (
            <span className="active-thread-badge">
              Conversación Activa: <strong>{threads.find(t => t.id === currentThreadId)?.title || currentThreadId}</strong>
            </span>
          )}
        </div>

        {threads.length === 0 ? (
          <div className="empty-history-state">
            <History size={48} color="#94a3b8" />
            <p className="empty-title">No hay conversaciones registradas</p>
            <p className="empty-desc">Crea una nueva conversación para comenzar a planificar con la IA.</p>
            <button className="btn-primary-create" onClick={createNewThread}>
              <Plus size={16} /> Crear Primera Conversación
            </button>
          </div>
        ) : (
          <div className="threads-history-grid">
            {threads.map((t) => {
              const isActive = t.id === currentThreadId;

              return (
                <div 
                  key={t.id} 
                  className={`thread-card ${isActive ? 'active-card' : ''}`}
                  onClick={() => handleOpenThread(t.id)}
                >
                  <div className="card-top">
                    <div className="thread-title-box">
                      <MessageCircle size={18} className="thread-icon" />
                      <h4 className="thread-card-title">{t.title}</h4>
                    </div>
                    {isActive && <span className="current-badge">ACTIVA</span>}
                  </div>

                  <div className="thread-card-meta">
                    <span className="meta-time">
                      <Clock size={12} /> {t.createdAt}
                    </span>
                    <span className="meta-id">ID: {t.id.slice(0, 16)}...</span>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-card-open"
                      onClick={() => handleOpenThread(t.id)}
                    >
                      <MessageSquare size={14} /> Abrir Chat
                    </button>
                    <button 
                      className="btn-card-delete"
                      onClick={(e) => handleDeleteThread(e, t.id, t.title)}
                      title="Eliminar esta conversación"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
