import React from 'react';
import { Video, ExternalLink, MonitorPlay, Headphones, Layers, FileText, Globe, FileDown } from 'lucide-react';
import type { RecursoMultimodal, VisualizadoresData } from '../../types';
import { useLangGraph } from '../../context/LangGraphContext';
import { exportToWord } from '../../utils/wordExporter';

export const MultimodalView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab } = useLangGraph();
  const data = multimodals || [];
  const resources = data;

  const getYouTubeEmbedUrl = (urlStr: string) => {
    if (urlStr.includes('youtube.com/watch?v=')) {
      const id = urlStr.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (urlStr.includes('youtu.be/')) {
      const id = urlStr.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    return null;
  };

  const getCardIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <MonitorPlay size={14} />;
      case 'audio': return <Headphones size={14} />;
      case 'documento': return <FileText size={14} />;
      case 'sitio_web': return <Globe size={14} />;
      default: return <Layers size={14} />;
    }
  };

  return (
    <div className="multimodal-visualizer-container">
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <Video size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 className="visualizer-title">Recursos Multimodales</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de los recursos sugeridos para las actividades de aprendizaje
            </p>
          </div>
        </div>

        {plan && (
          <button
            className="btn-header-action"
            onClick={() => exportToWord({ plan, rubrics, multimodals }, showErrorNotification)}
            title="Exportar planificación y recursos a Microsoft Word (.docx)"
          >
            <FileDown size={16} /> Exportar
          </button>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="empty-view-card-state">
          <Video size={48} color="#94a3b8" />
          <p className="empty-title">No hay recursos multimodales disponibles</p>
          <p className="empty-desc">
            {plan 
              ? 'La planificación seleccionada no contiene recursos multimodales registrados.'
              : 'Selecciona una planificación en el historial para visualizar los recursos multimodales.'}
          </p>
          <button
            className="btn-primary-action"
            onClick={() => setActiveViewTab('planifications')}
          >
            <Layers size={16} /> Ver Planificaciones
          </button>
        </div>
      ) : (
        <div className="resources-grid">
          {(resources || []).map((res: RecursoMultimodal, index: number) => {
            const resTipo = res.tipo;
            const resUrl = res.url;
            const embedUrl = resTipo === 'video' ? getYouTubeEmbedUrl(resUrl) : null;

            return (
              <div key={index} className="resource-card">
                <div className={`card-badge ${resTipo}`}>
                  {getCardIcon(resTipo)} {resTipo.toUpperCase()}
                </div>

                {embedUrl ? (
                  <div className="video-embed-wrapper">
                    <iframe
                      src={embedUrl}
                      title={res.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={`preview-box type-${res.tipo}`}>
                    <div className="sim-icon-bg">
                      {getCardIcon(res.tipo)}
                    </div>
                    <span>{res.titulo}</span>
                  </div>
                )}

                <div className="card-content">
                  <h4 className="card-title">{res.titulo}</h4>

                  <div className="card-footer">
                    <span className="meta-tag">Formato: {res.tipo}</span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-link"
                    >
                      Abrir Recurso <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .multimodal-visualizer-container {
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
          background: #ffffff;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
          flex-shrink: 0;
        }

        .visualizer-title {
          font-family: var(--font-heading);
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

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 1.25rem;
        }

        .resource-card {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }

        .resource-card:hover {
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.1);
          transform: translateY(-2px);
          border-color: #bfdbfe;
        }

        .card-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .card-badge.video { background: #fee2e2; color: #dc2626; }
        .card-badge.sitio_web { background: #dbeafe; color: #1e40af; }
        .card-badge.audio { background: #f3e8ff; color: #7e22ce; }
        .card-badge.imagen { background: #dcfce7; color: #166534; }
        .card-badge.documento { background: #fef3c7; color: #92400e; }

        .video-embed-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background: #0f172a;
        }

        .video-embed-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .preview-box {
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 1rem;
          text-align: center;
        }

        .preview-box.type-sitio_web { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1d4ed8; }
        .preview-box.type-audio { background: linear-gradient(135deg, #f3e8ff, #fae8ff); color: #7e22ce; }
        .preview-box.type-documento { background: linear-gradient(135deg, #fef3c7, #fef08a); color: #92400e; }

        .sim-icon-bg {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        }

        .card-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .card-desc {
          font-size: 0.825rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0;
        }

        .query-tag {
          font-size: 0.725rem;
          color: #1e40af;
          background: #eff6ff;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          margin-top: 0.25rem;
        }

        .card-footer {
          margin-top: auto;
          padding-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f1f5f9;
        }

        .meta-tag {
          font-size: 0.725rem;
          color: #64748b;
          font-weight: 500;
        }

        .btn-link {
          color: #2563eb;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .multimodal-visualizer-container {
            padding: 0.85rem;
          }
          .resources-grid {
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
            gap: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};
