import React, { useState, useEffect } from 'react';
import { ClipboardCheck, FileDown, Layers, Edit3 } from 'lucide-react';
import type { CriterioEvaluacion, VisualizadoresData } from '../../types';
import { useLangGraph } from '../../context/LangGraphContext';
import { exportToWord } from '../../utils/wordExporter';
import { ElementEditorPopover, type SelectedElementInfo } from './ElementEditorPopover';

export const RubricView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab, sendMessage, showNotificationBanner } = useLangGraph();
  // ponytail: Use rubrics array directly without creating redundant intermediate mapped array
  const tools = rubrics || [];

  const [isEditorMode, setIsEditorMode] = useState<boolean>(true);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.element-editor-popover') && !target.closest('.word-editable-element')) {
        setSelectedElement(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleElementSelect = (
    e: React.MouseEvent,
    info: {
      id?: string;
      label: string;
      selector?: string;
      previewText?: string;
    }
  ) => {
    if (!isEditorMode) return;
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const selText = window.getSelection()?.toString().trim();

    setSelectedElement({
      ...info,
      selectedText: selText || undefined,
      rect: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      },
    });
  };

  const handleEditorSubmit = async (instruction: string, intent: 'change' | 'question') => {
    if (!selectedElement) return;
    setIsSubmitting(true);
    try {
      let messageToSend = '';
      if (intent === 'change') {
        if (selectedElement.id) {
          messageToSend = `${selectedElement.id}: ${instruction}`;
        } else if (selectedElement.selectedText) {
          messageToSend = `[${selectedElement.label}] "${selectedElement.selectedText}": ${instruction}`;
        } else {
          messageToSend = `[${selectedElement.label}]: ${instruction}`;
        }
      } else {
        if (selectedElement.id) {
          messageToSend = `${selectedElement.id}: Consulta: ${instruction}`;
        } else {
          messageToSend = `Consulta sobre [${selectedElement.label}]: ${instruction}`;
        }
      }

      setSelectedElement(null);
      showNotificationBanner(`Cambio enviado al chat: ${messageToSend}`);
      setActiveViewTab('chat');
      await sendMessage(messageToSend);
    } catch {
      showErrorNotification('No fue posible enviar la instrucción al chat.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className={`btn-header-editor-toggle ${isEditorMode ? 'active' : ''}`}
              onClick={() => {
                setIsEditorMode(!isEditorMode);
                if (selectedElement) setSelectedElement(null);
              }}
              title={isEditorMode ? "Desactivar modo editor" : "Activar modo editor para seleccionar y modificar elementos"}
            >
              <Edit3 size={15} />
              <span>{isEditorMode ? 'Editor Activo' : 'Editar Elementos'}</span>
            </button>

            <button
              className="btn-header-action"
              onClick={() => exportToWord({ plan, rubrics, multimodals }, showErrorNotification)}
              title="Exportar planificación y herramientas a Microsoft Word (.docx)"
            >
              <FileDown size={16} /> Exportar
            </button>
          </div>
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
        <>
          {isEditorMode && (
            <div className="editor-mode-hint-banner">
              <Edit3 size={15} />
              <span>Modo Editor: Haz clic sobre el título, escala o criterios de evaluación para seleccionarlos y enviar cambios al chat.</span>
            </div>
          )}

          {tools.map((tool, tIdx: number) => {
            const isRubrica = tool.tipo === 'rubrica';
            const cleanedEscala = tool.instrumento_generado?.escala || [];
            const criterios = tool.instrumento_generado?.criterios || [];
            const isTitleSelected = selectedElement?.selector === `tool-${tIdx}-title`;

            return (
              <div key={tIdx} className="rubric-section" style={{ marginBottom: tIdx < tools.length - 1 ? '1.75rem' : '0' }}>
                <h3 
                  className={`section-title ${isEditorMode ? 'word-editable-element' : ''} ${isTitleSelected ? 'word-element-selected' : ''}`}
                  onClick={(e) => handleElementSelect(e, {
                    id: tool.id_actividad,
                    label: 'Herramienta de Evaluación',
                    selector: tool.id_actividad ? `instrumento[id="${tool.id_actividad}"].titulo` : `tool-${tIdx}-title`,
                    previewText: tool.titulo,
                  })}
                  title={isEditorMode ? "Haz clic para editar el título de esta herramienta" : undefined}
                >
                  <span>{tool.titulo}</span>
                </h3>

                <div className="table-responsive">
                  <table className="rubric-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Criterios de Evaluación</th>
                        {cleanedEscala.map((nivel: string, idx: number) => {
                          const isScaleSelected = selectedElement?.selector === `tool-${tIdx}-scale-${idx}`;
                          return (
                            <th 
                              key={idx}
                              className={isEditorMode ? `word-editable-element ${isScaleSelected ? 'word-element-selected' : ''}` : ''}
                              onClick={(e) => handleElementSelect(e, {
                                id: tool.id_actividad,
                                label: `Nivel de Escala (${nivel})`,
                                selector: tool.id_actividad ? `instrumento[id="${tool.id_actividad}"].escala[${idx}]` : `tool-${tIdx}-scale-${idx}`,
                                previewText: nivel,
                              })}
                              title={isEditorMode ? `Haz clic para editar el nivel ${nivel}` : undefined}
                            >
                              {nivel}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {criterios.map((crit: CriterioEvaluacion, cIdx: number) => {
                        const critName = crit.nombre;
                        const defs = crit.definiciones;
                        const isCritSelected = selectedElement?.selector === `tool-${tIdx}-crit-${cIdx}`;

                        return (
                          <tr key={cIdx}>
                            <td 
                              className={`criterion-cell ${isEditorMode ? 'word-editable-element' : ''} ${isCritSelected ? 'word-element-selected' : ''}`}
                              onClick={(e) => handleElementSelect(e, {
                                id: tool.id_actividad,
                                label: 'Criterio de Evaluación',
                                selector: tool.id_actividad ? `instrumento[id="${tool.id_actividad}"].criterio[${cIdx}]` : `tool-${tIdx}-crit-${cIdx}`,
                                previewText: critName,
                              })}
                              title={isEditorMode ? "Haz clic para editar este criterio de evaluación" : undefined}
                            >
                              <strong>{critName}</strong>
                            </td>
                            {cleanedEscala.map((nivel: string, sIdx: number) => {
                              const cellDef = isRubrica && defs && defs[sIdx] ? defs[sIdx] : '';
                              const isDefSelected = selectedElement?.selector === `tool-${tIdx}-crit-${cIdx}-def-${sIdx}`;
                              return (
                                <td 
                                  key={sIdx}
                                  className={isEditorMode ? `word-editable-element ${isDefSelected ? 'word-element-selected' : ''}` : ''}
                                  onClick={(e) => handleElementSelect(e, {
                                    id: tool.id_actividad,
                                    label: `Descriptor (${nivel}): ${critName}`,
                                    selector: tool.id_actividad ? `instrumento[id="${tool.id_actividad}"].criterio[${cIdx}].definicion[${sIdx}]` : `tool-${tIdx}-crit-${cIdx}-def-${sIdx}`,
                                    previewText: cellDef,
                                  })}
                                  title={isEditorMode ? `Haz clic para editar la definición para ${nivel}` : undefined}
                                >
                                  {cellDef || null}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

      <ElementEditorPopover
        selected={selectedElement}
        onClose={() => setSelectedElement(null)}
        onSubmit={handleEditorSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
