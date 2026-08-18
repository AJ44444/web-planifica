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
            <History size={20} color="#ffffff" />
          </div>
          <div>
            <h2 className="visualizer-title">Historial de Conversaciones</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de todas las conversaciones creadas y gestión de historial
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

      <style>{`
        .history-visualizer-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 4px 20px -2px rgba(29, 78, 216, 0.08);
        }

        .visualizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 0.65rem;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
          flex-shrink: 0;
        }

        .visualizer-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .visualizer-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .btn-new-thread-action {
          background: #1d4ed8;
          color: #ffffff;
          border: none;
          padding: 0.55rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-new-thread-action:hover {
          background: #1e40af;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
        }

        .history-content-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-stats-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.825rem;
          color: #64748b;
        }

        .stats-badge, .active-thread-badge {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.35rem 0.75rem;
          border-radius: 0.4rem;
        }

        .stats-badge strong, .active-thread-badge strong {
          color: #1d4ed8;
        }

        .empty-history-state {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 0.75rem;
        }

        .empty-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .empty-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .btn-primary-create {
          margin-top: 0.5rem;
          background: #1d4ed8;
          color: #ffffff;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
        }

        .threads-history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .thread-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .thread-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 4px 16px rgba(29, 78, 216, 0.08);
          transform: translateY(-2px);
        }

        .thread-card.active-card {
          border-color: #2563eb;
          background: #f8fafc;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .thread-title-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .thread-icon {
          color: #1d4ed8;
          flex-shrink: 0;
        }

        .thread-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .current-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #047857;
          background: #dcfce7;
          border: 1px solid #86efac;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
        }

        .thread-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #64748b;
        }

        .meta-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .meta-id {
          font-family: monospace;
          font-size: 0.7rem;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-top: 1px solid #f1f5f9;
          padding-top: 0.75rem;
          margin-top: auto;
        }

        .btn-card-open {
          flex: 1;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.45rem 0.75rem;
          border-radius: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-card-open:hover {
          background: #dbeafe;
          border-color: #2563eb;
        }

        .btn-card-delete {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          padding: 0.45rem 0.75rem;
          border-radius: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-card-delete:hover {
          background: #ffe4e6;
          border-color: #fda4af;
          color: #be123c;
        }

        /* Mobile Responsive Rules */
        @media (max-width: 900px) {
          .visualizer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.85rem;
          }

          .btn-new-thread-action {
            width: 100%;
            justify-content: center;
          }

          .history-stats-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
