import React from 'react';
import type { InstrumentoEvaluacion } from '../../types';
import { ClipboardCheck, Award } from 'lucide-react';

interface RubricViewProps {
  data?: InstrumentoEvaluacion | null;
}



// Helper function to strip score points from scale labels e.g. "Excelente (4 pts)" -> "Excelente"
const cleanScaleLabel = (label: string): string => {
  return label.replace(/\s*\(\d+\s*(?:pts|puntos)?\)/gi, '').trim();
};

export const RubricView: React.FC<RubricViewProps> = ({ data }) => {
  const tools = data?.herramientas && data.herramientas.length > 0 
    ? data.herramientas 
    : (data?.instrumento_generado?.criterios ? [{
        tipo: data.tipo || 'rubrica',
        titulo: data.titulo || 'Herramientas de Evaluación',
        escala: data.instrumento_generado.escala || ['Excelente', 'Satisfactorio', 'En proceso', 'Necesita apoyo'],
        criterios: data.instrumento_generado.criterios
      }] : []);

  if (!data || tools.length === 0) {
    return (
      <div className="empty-visualizer-container">
        <div className="empty-visualizer-content">
          <div className="hero-logo-box">
            <ClipboardCheck size={44} color="#ffffff" />
          </div>
          <h2 className="empty-visualizer-title">
            No has solicitado ver una planificación completa en el chat
          </h2>
          <p className="empty-visualizer-subtitle">
            Solicítala en el chat para ver el detalle estructurado de las herramientas de evaluación, rúbricas analíticas y listas de cotejo.
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
            font-family: 'Outfit', sans-serif;
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

  return (
    <div className="rubric-block-container">
      {/* Visualizer Header */}
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <ClipboardCheck size={20} color="#ffffff" />
          </div>
          <div>
            <h2 className="visualizer-title">Herramientas de evaluación</h2>
            <p className="visualizer-subtitle">
              Visualización estructurada de las herramientas de evaluación para las actividades de aprendizaje
            </p>
          </div>
        </div>
      </div>

      {tools.map((tool, tIdx) => {
        const isRubrica = tool.tipo === 'rubrica';
        const cleanedEscala = (tool.escala || []).map(cleanScaleLabel);

        return (
          <div key={tIdx} className="rubric-section" style={{ marginBottom: tIdx < tools.length - 1 ? '1.75rem' : '0' }}>
            <h3 className="section-title">
              <Award size={16} color="#1d4ed8" />
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
                  {(tool.criterios || []).map((crit: any, cIdx: number) => {
                    const critName = crit.nombre || crit.aspecto_o_criterio || `Criterio #${cIdx + 1}`;
                    const defs = crit.definiciones || [
                      crit.excelente || 'Ejecuta el aspecto con excelencia.',
                      crit.satisfactorio || 'Ejecuta el aspecto de forma satisfactoria.',
                      crit.en_proceso || 'Ejecuta el aspecto en proceso de mejora.',
                      crit.necesita_apoyo || 'Requiere apoyo y nivelación.'
                    ];

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
      })}

      <style>{`
        .rubric-block-container {
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

        .rubric-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 1rem;
          font-weight: 700;
          color: #1d4ed8;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .rubric-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #e2e8f0;
          border-radius: 0.65rem;
          overflow: hidden;
        }

        .rubric-table th {
          background: #eff6ff;
          color: #1d4ed8;
          border-bottom: 1px solid #bfdbfe;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
        }

        .rubric-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.825rem;
          color: #0f172a;
          line-height: 1.45;
          vertical-align: top;
        }

        .rubric-table tr:last-child td {
          border-bottom: none;
        }

        .rubric-table tr:nth-child(odd) td {
          background: #ffffff;
        }

        .rubric-table tr:nth-child(even) td {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};
