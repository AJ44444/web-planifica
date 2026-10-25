import React from 'react';
import { ClipboardCheck, FileDown, Layers } from 'lucide-react';
import type { CriterioEvaluacion, VisualizadoresData } from '../../types';
import { useLangGraph } from '../../context/LangGraphContext';
import { exportToWord } from '../../utils/wordExporter';

export const RubricView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab } = useLangGraph();
  // ponytail: Use rubrics array directly without creating redundant intermediate mapped array
  const tools = rubrics || [];

  return (
    <div className="rubric-block-container">
      {/* Visualizer Header */}
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <ClipboardCheck size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 className="visualizer-title">Herramientas de Evaluación</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de las herramientas de evaluación para las actividades de aprendizaje
            </p>
          </div>
        </div>

        {plan && (
          <button
            className="btn-header-action"
            onClick={() => exportToWord({ plan, rubrics, multimodals }, showErrorNotification)}
            title="Exportar planificación y herramientas a Microsoft Word (.docx)"
          >
            <FileDown size={16} /> Exportar
          </button>
        )}
      </div>

      {tools.length === 0 ? (
        <div className="empty-view-card-state">
          <ClipboardCheck size={48} color="#94a3b8" />
          <p className="empty-title">No hay herramientas de evaluación disponibles</p>
          <p className="empty-desc">
            {plan 
              ? 'La planificación seleccionada no contiene herramientas de evaluación registradas.'
              : 'Selecciona una planificación en el historial para visualizar sus herramientas de evaluación.'}
          </p>
          <button
            className="btn-primary-action"
            onClick={() => setActiveViewTab('planifications')}
          >
            <Layers size={16} /> Ver Planificaciones
          </button>
        </div>
      ) : (
        tools.map((tool, tIdx: number) => {
          const isRubrica = tool.tipo === 'rubrica';
          const cleanedEscala = tool.instrumento_generado?.escala || [];
          const criterios = tool.instrumento_generado?.criterios || [];

          return (
            <div key={tIdx} className="rubric-section" style={{ marginBottom: tIdx < tools.length - 1 ? '1.75rem' : '0' }}>
              <h3 className="section-title">
                <span>{tool.titulo}</span>
              </h3>

              <div className="table-responsive">
                <table className="rubric-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Criterios de Evaluación</th>
                      {cleanedEscala.map((nivel: string, idx: number) => (
                        <th key={idx}>{nivel}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {criterios.map((crit: CriterioEvaluacion, cIdx: number) => {
                      const critName = crit.nombre;
                      const defs = crit.definiciones;

                      return (
                        <tr key={cIdx}>
                          <td className="criterion-cell">
                            <strong>{critName}</strong>
                          </td>
                          {cleanedEscala.map((_: string, sIdx: number) => (
                            <td key={sIdx}>
                              {isRubrica && defs && defs[sIdx] ? defs[sIdx] : null}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};