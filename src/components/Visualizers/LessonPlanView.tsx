import React, { useState } from 'react';
import { exportToWord } from '../../utils/wordExporter';
import { useLangGraph } from '../../context/LangGraphContext';
import { 
  BookOpen, 
  Target, 
  UserCheck, 
  MapPin, 
  Building2, 
  Clock, 
  GraduationCap, 
  Award, 
  Users,
  FileDown,
  Layers
} from 'lucide-react';

import type { FilaCurricularPlan, VisualizadoresData } from '../../types';

export const LessonPlanView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab } = useLangGraph();

  const data = plan || null;

  const [selectedNode, setSelectedNode] = useState<{
    rowIdx: number;
    indicatorIdx: number;
    contentIdx?: number;
  } | null>(null);

  const { metadatos, encabezado, desarrollo_curricular } = data || {};
  const hasValidPlan = Boolean(data && desarrollo_curricular && desarrollo_curricular.length > 0);

  const handleNodeClick = (rowIdx: number, indicatorIdx: number, contentIdx?: number) => {
    if (
      selectedNode?.rowIdx === rowIdx &&
      selectedNode?.indicatorIdx === indicatorIdx &&
      selectedNode?.contentIdx === contentIdx
    ) {
      setSelectedNode(null);
    } else {
      setSelectedNode({ rowIdx, indicatorIdx, contentIdx });
    }
  };

  return (
    <div className="plan-visualizer-container">
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <BookOpen size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 className="visualizer-title">Planificación de Aprendizajes</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de la secuencia didáctica
            </p>
          </div>
        </div>

        {hasValidPlan && (
          <button
            className="btn-header-action"
            onClick={() => exportToWord({ plan, rubrics, multimodals }, showErrorNotification)}
            title="Exportar planificación a Microsoft Word (.docx)"
          >
            <FileDown size={16} /> Exportar
          </button>
        )}
      </div>

      {!hasValidPlan ? (
        <div className="empty-view-card-state">
          <BookOpen size={48} color="#94a3b8" />
          <p className="empty-title">No se ha seleccionado una planificación</p>
          <p className="empty-desc">Selecciona una planificación en el historial para visualizarla aquí.</p>
          <button
            className="btn-primary-action"
            onClick={() => setActiveViewTab('planifications')}
          >
            <Layers size={16} /> Ver Planificaciones
          </button>
        </div>
      ) : (
        <>
          <div className="plan-metadata-grid">
        <div className="meta-card">
          <span className="meta-label"><Building2 size={12} /> Centro Educativo</span>
          <span className="meta-value">{encabezado?.centro_educativo}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><MapPin size={12} /> Ubicación</span>
          <span className="meta-value">{encabezado?.lugar}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><UserCheck size={12} /> Docente</span>
          <span className="meta-value">{encabezado?.nombre_docente}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><GraduationCap size={12} /> Carrera</span>
          <span className="meta-value">{metadatos?.carrera}</span>
        </div>

        <div className="meta-card">
          <span className="meta-label"><BookOpen size={12} /> Curso</span>
          <span className="meta-value">{metadatos?.subarea_curricular}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><Award size={12} /> Grado</span>
          <span className="meta-value">{encabezado?.grado}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><Users size={12} /> Sección</span>
          <span className="meta-value">{encabezado?.seccion}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><Clock size={12} /> Duración</span>
          <span className="meta-value">{encabezado?.duracion}</span>
        </div>
      </div>

      {(desarrollo_curricular || []).map((fila: FilaCurricularPlan, rowIdx: number) => {
        const isFilaActive = selectedNode?.rowIdx === rowIdx;
        const indicadores = fila.indicadores_logro || [];
        const actividades = fila.actividades_aprendizaje || [];

        return (
          <div key={rowIdx} className="curricular-row-block">

            <div className={`competency-tree-box ${isFilaActive ? 'has-active-path' : ''}`}>
              <div className={`tree-root-node ${isFilaActive ? 'active-root' : ''}`}>
                <div className="box-title">
                  <Target size={16} color={isFilaActive ? '#2563eb' : '#1d4ed8'} />
                  <span>Competencia Curricular</span>
                </div>
                <p className="competency-text">{fila.competencia}</p>
              </div>

              <div className="tree-container">
                <div className={`tree-branches-wrapper ${isFilaActive ? 'trunk-highlighted' : ''}`}>
                  {indicadores.map((ind: any, idx: number) => {
                    const isIndicatorSelected =
                      isFilaActive && selectedNode?.indicatorIdx === idx;

                    return (
                      <div key={idx} className="tree-branch-group">
                        <div
                          className={`tree-branch-node ${isIndicatorSelected ? 'active-branch' : ''}`}
                          onClick={() => handleNodeClick(rowIdx, idx)}
                          title="Haz clic para seleccionar este indicador de logro"
                        >
                          <div className="branch-line-connector" />
                          <div className="branch-content-box">
                            <span className="ind-badge">📌 Indicador de Logro</span>
                            <span className="ind-name">{ind.indicador}</span>
                          </div>
                        </div>

                        {ind.contenidos && ind.contenidos.length > 0 && (
                          <div className={`tree-leaves-wrapper ${isIndicatorSelected ? 'subtrunk-highlighted' : ''}`}>
                            {ind.contenidos.map((c: string, cIdx: number) => {
                              const isContentSelected =
                                isIndicatorSelected && selectedNode?.contentIdx === cIdx;

                              return (
                                <div
                                  key={cIdx}
                                  className={`tree-leaf-node ${isContentSelected ? 'active-leaf' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNodeClick(rowIdx, idx, cIdx);
                                  }}
                                  title="Haz clic para seleccionar e iluminar la línea de conexión"
                                >
                                  <div className="leaf-line-connector" />
                                  <div className="leaf-content-box">
                                    <span className="content-bullet">📖</span>
                                    <span className="content-text">{c}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="plan-table-wrapper">
              <div className="table-responsive">
                <table className="plan-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Fase Metodológica</th>
                      <th>Detalle e Instrucciones de la Actividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.map((act: any, actIdx: number) => {
                      const faseStr = act.fase ? String(act.fase).toLowerCase() : 'desarrollo';
                      return (
                        <tr key={act.id_actividad || actIdx}>
                          <td>
                            <span className={`phase-pill phase-${faseStr}`}>
                              Fase: {faseStr.toUpperCase()}
                            </span>
                          </td>
                          <td>{act.descripcion}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
      </>
      )}
    </div>
  );
};
