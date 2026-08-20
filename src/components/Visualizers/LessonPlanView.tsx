import React, { useState } from 'react';
import type { PlanificacionClase, InstrumentoEvaluacion, RecursoMultimodal } from '../../types';
import { exportToWord } from '../../utils/wordExporter';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Building2, 
  Clock, 
  GraduationCap, 
  Award, 
  Users,
  FileDown
} from 'lucide-react';

interface LessonPlanViewProps {
  data?: PlanificacionClase | null;
  rubricData?: InstrumentoEvaluacion | null;
  multimodalData?: RecursoMultimodal[] | null;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ 
  data,
  rubricData,
  multimodalData
}) => {
  // Selected tree node path state for interactive branch highlight
  const [selectedNode, setSelectedNode] = useState<{
    filaId: number;
    indicatorIdx: number;
    contentIdx?: number;
  } | null>(null);

  if (!data || !data.desarrollo_curricular || data.desarrollo_curricular.length === 0) {
    return (
      <div className="empty-visualizer-container">
        <div className="empty-visualizer-content">
          <div className="hero-logo-box">
            <BookOpen size={44} color="#ffffff" />
          </div>
          <h2 className="empty-visualizer-title">
            No has solicitado ver una planificación completa en el chat
          </h2>
          <p className="empty-visualizer-subtitle">
            Solicítala en el chat para ver el detalle estructurado de la secuencia didáctica.
          </p>
        </div>

        <style>{`
          .empty-visualizer-container {
            background: #ffffff;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            padding: 4rem 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-shadow: 0 4px 20px -2px rgba(29, 78, 216, 0.08);
            min-height: 420px;
          }

          .empty-visualizer-content {
            max-width: 520px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.25rem;
          }

          .hero-logo-box {
            width: 72px;
            height: 72px;
            border-radius: 1.25rem;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px -5px rgba(29, 78, 216, 0.35);
          }

          .empty-visualizer-title {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.4;
            margin: 0;
          }

          .empty-visualizer-subtitle {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.6;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  const { encabezado, desarrollo_curricular } = data;

  const handleNodeClick = (filaId: number, indicatorIdx: number, contentIdx?: number) => {
    if (
      selectedNode?.filaId === filaId &&
      selectedNode?.indicatorIdx === indicatorIdx &&
      selectedNode?.contentIdx === contentIdx
    ) {
      setSelectedNode(null); // toggle off
    } else {
      setSelectedNode({ filaId, indicatorIdx, contentIdx });
    }
  };

  return (
    <div className="plan-visualizer-container">
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <BookOpen size={20} color="#ffffff" />
          </div>
          <div>
            <h2 className="visualizer-title">Planificación Didáctica</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de la secuencia didáctica
            </p>
          </div>
        </div>

        <button
          className="btn-export-word"
          onClick={() => exportToWord(data, rubricData, multimodalData)}
          title="Exportar planificación a Microsoft Word (.docx)"
        >
          <FileDown size={16} /> Exportar
        </button>
      </div>

      {/* Administrative Header (8 Cards arranged 4 and 4) */}
      <div className="plan-metadata-grid">
        {/* Row 1: 4 Cards */}
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
          <span className="meta-value">{encabezado?.nombre_docente || (encabezado as any)?.docente}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label"><GraduationCap size={12} /> Carrera</span>
          <span className="meta-value">{encabezado?.carrera}</span>
        </div>

        {/* Row 2: 4 Cards */}
        <div className="meta-card">
          <span className="meta-label"><BookOpen size={12} /> Curso</span>
          <span className="meta-value">{encabezado?.curso || (encabezado as any)?.subarea}</span>
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

      {/* Development Curriculum Blocks (Independent block for each row) */}
      {(desarrollo_curricular || []).map((fila, filaIdx) => {
        const filaId = fila.id_fila || (filaIdx + 1);
        const isFilaActive = selectedNode?.filaId === filaId;
        const indicadores = fila.indicadores_logro || (fila as any).indicadores_logro_y_contenidos || [];
        const actividades = fila.actividades_aprendizaje || [];

        return (
          <div key={filaId} className="curricular-row-block">
            {fila.titulo_fila && (
              <div className="fila-title-banner">
                <span className="banner-text">## {fila.titulo_fila}</span>
              </div>
            )}
            {/* Tree View: Competencia => Indicadores de logro => Contenidos */}
            <div className={`competency-tree-box ${isFilaActive ? 'has-active-path' : ''}`}>
              {/* Root Node: Competencia */}
              <div className={`tree-root-node ${isFilaActive ? 'active-root' : ''}`}>
                <div className="box-title">
                  <Target size={16} color={isFilaActive ? '#2563eb' : '#1d4ed8'} />
                  <span>Competencia Curricular</span>
                </div>
                <p className="competency-text">{fila.competencia}</p>
              </div>

              {/* Tree Hierarchy Structure */}
              <div className="tree-container">
                <div className={`tree-branches-wrapper ${isFilaActive ? 'trunk-highlighted' : ''}`}>
                  {indicadores.map((ind: any, idx: number) => {
                    const isIndicatorSelected =
                      isFilaActive && selectedNode?.indicatorIdx === idx;

                    return (
                      <div key={idx} className="tree-branch-group">
                        {/* Branch Node: Indicador de logro */}
                        <div
                          className={`tree-branch-node ${isIndicatorSelected ? 'active-branch' : ''}`}
                          onClick={() => handleNodeClick(filaId, idx)}
                          title="Haz clic para seleccionar este indicador de logro"
                        >
                          <div className="branch-line-connector" />
                          <div className="branch-content-box">
                            <span className="ind-badge">📌 Indicador de Logro</span>
                            <span className="ind-name">{ind.indicador}</span>
                          </div>
                        </div>

                        {/* Leaf Nodes: Contenidos */}
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
                                    handleNodeClick(filaId, idx, cIdx);
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

            {/* Learning Activities */}
            <div className="plan-table-wrapper">
              <h3 className="section-subtitle">
                <Calendar size={16} color="#2563eb" />
                <span>Actividades de Aprendizaje</span>
              </h3>

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
        );
      })}

      <style>{`
        .plan-visualizer-container {
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 4px 20px -2px rgba(29, 78, 216, 0.08);
        }

        .fila-title-banner {
          background: #eff6ff;
          border-left: 4px solid #1d4ed8;
          padding: 0.65rem 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .fila-title-banner .banner-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.05rem;
          color: #1d4ed8;
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

        .btn-export-word {
          background: #1d4ed8;
          color: #ffffff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
        }

        .btn-export-word:hover {
          background: #1e40af;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.3);
          transform: translateY(-1px);
        }

        .plan-metadata-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        @media (max-width: 992px) {
          .plan-metadata-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .plan-metadata-grid {
            grid-template-columns: 1fr;
          }
        }

        .meta-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 0.85rem;
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.15s ease;
        }

        .meta-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .meta-label {
          font-size: 0.725rem;
          font-weight: 700;
          color: #1d4ed8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .meta-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          margin-top: 0.25rem;
          line-height: 1.3;
        }

        .curricular-row-block {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          background: #ffffff;
        }

        /* Tree View Styling & Connector Lines */
        .competency-tree-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: all 0.25s ease;
        }

        .competency-tree-box.has-active-path {
          border-color: #93c5fd;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
        }

        .tree-root-node {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.65rem;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .tree-root-node.active-root {
          background: #dbeafe;
          border-color: #2563eb;
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.25);
        }

        .box-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          font-size: 0.85rem;
          color: #1d4ed8;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .competency-text {
          font-size: 0.925rem;
          color: #0f172a;
          line-height: 1.5;
          font-weight: 600;
        }

        .tree-container {
          margin-top: 1.15rem;
          padding-left: 0.25rem;
        }

        .tree-section-header {
          font-size: 0.725rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.85rem;
        }

        .tree-branches-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          position: relative;
          padding-left: 1.25rem;
          border-left: 2px solid #cbd5e1;
          transition: border-color 0.2s ease;
        }

        .tree-branches-wrapper.trunk-highlighted {
          border-left-color: #1d4ed8;
          box-shadow: -2px 0 8px rgba(29, 78, 216, 0.3);
        }

        .tree-branch-group {
          position: relative;
        }

        .tree-branch-node {
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
          padding-left: 1.25rem;
          transition: all 0.2s ease;
        }

        .branch-line-connector {
          position: absolute;
          left: -1.25rem;
          top: 50%;
          width: 1.25rem;
          height: 2px;
          background: #cbd5e1;
          transition: all 0.2s ease;
        }

        .tree-branch-node.active-branch .branch-line-connector {
          background: #1d4ed8;
          height: 3px;
          box-shadow: 0 0 8px rgba(29, 78, 216, 0.6);
        }

        .branch-content-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          width: 100%;
          transition: all 0.2s ease;
        }

        .tree-branch-node:hover .branch-content-box {
          border-color: #93c5fd;
          background: #eff6ff;
        }

        .tree-branch-node.active-branch .branch-content-box {
          background: #eff6ff;
          border-color: #2563eb;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.18);
        }

        .ind-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: #1d4ed8;
          text-transform: uppercase;
        }

        .ind-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
        }

        .tree-leaves-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.6rem;
          margin-left: 2rem;
          padding-left: 1.25rem;
          border-left: 2px dashed #cbd5e1;
          position: relative;
          transition: border-color 0.2s ease;
        }

        .tree-leaves-wrapper.subtrunk-highlighted {
          border-left-style: solid;
          border-left-color: #1d4ed8;
          box-shadow: -2px 0 8px rgba(29, 78, 216, 0.3);
        }

        .tree-leaf-node {
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
          padding-left: 1.25rem;
          transition: all 0.2s ease;
        }

        .leaf-line-connector {
          position: absolute;
          left: -1.25rem;
          top: 50%;
          width: 1.25rem;
          height: 2px;
          background: #cbd5e1;
          transition: all 0.2s ease;
        }

        .tree-leaf-node.active-leaf .leaf-line-connector {
          background: #1d4ed8;
          height: 3px;
          box-shadow: 0 0 8px rgba(29, 78, 216, 0.6);
        }

        .leaf-content-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: #334155;
          width: 100%;
          transition: all 0.2s ease;
        }

        .tree-leaf-node:hover .leaf-content-box {
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        .tree-leaf-node.active-leaf .leaf-content-box {
          background: #eff6ff;
          border-color: #2563eb;
          color: #1d4ed8;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.15);
        }

        .content-bullet {
          font-size: 0.85rem;
        }

        .plan-table-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-subtitle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.95rem;
          color: #0f172a;
          font-weight: 700;
        }

        .plan-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #e2e8f0;
          border-radius: 0.65rem;
          overflow: hidden;
        }

        .plan-table th {
          background: #eff6ff;
          color: #1d4ed8;
          border-bottom: 1px solid #bfdbfe;
          font-family: var(--font-heading);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
        }

        .plan-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #0f172a;
          vertical-align: top;
        }

        .plan-table tr:last-child td {
          border-bottom: none;
        }

        .plan-table tr:nth-child(even) td {
          background: #f8fafc;
        }

        .phase-pill {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.725rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .phase-inicio { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        .phase-desarrollo { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .phase-cierre { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
      `}</style>
    </div>
  );
};
