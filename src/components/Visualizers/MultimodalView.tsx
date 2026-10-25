import React from 'react';
import { Video, ExternalLink, MonitorPlay, Headphones, Layers, FileText, Globe, FileDown } from 'lucide-react';
import type { RecursoMultimodal, VisualizadoresData } from '../../types';
import { useLangGraph } from '../../context/LangGraphContext';
import { exportToWord } from '../../utils/wordExporter';

export const MultimodalView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab } = useLangGraph();
  const resources = multimodals || [];

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
    </div>
  );
};