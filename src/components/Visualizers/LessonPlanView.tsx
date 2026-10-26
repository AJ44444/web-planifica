import React, { useState, useEffect } from 'react';
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
  Layers,
  Edit3
} from 'lucide-react';

import type { FilaCurricularPlan, VisualizadoresData } from '../../types';
import { ElementEditorPopover, type SelectedElementInfo } from './ElementEditorPopover';

export const LessonPlanView: React.FC<VisualizadoresData> = ({ plan, rubrics, multimodals }) => {
  const { showErrorNotification, setActiveViewTab, sendMessage, showNotificationBanner } = useLangGraph();

  const data = plan || null;

  const [selectedNode, setSelectedNode] = useState<{
    rowIdx: number;
    indicatorIdx: number;
    contentIdx?: number;
  } | null>(null);

  const [isEditorMode, setIsEditorMode] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setIsEditorMode(false);
    setSelectedElement(null);
  }, [plan?._id, plan]);

  const { metadatos, encabezado, desarrollo_curricular } = data || {};
  const hasValidPlan = Boolean(data && desarrollo_curricular && desarrollo_curricular.length > 0);

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
              title="Exportar planificación a Microsoft Word (.docx)"
            >
              <FileDown size={16} /> Exportar
            </button>
          </div>
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
          {isEditorMode && (
            <div className="editor-mode-hint-banner">
              <Edit3 size={15} />
              <span>Modo Editor: Haz clic sobre cualquier elemento, celda o actividad para seleccionarlo y enviar cambios al chat.</span>
            </div>
          )}

          <div className="plan-metadata-grid">
            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.centro_educativo' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Centro Educativo',
                selector: 'encabezado.centro_educativo',
                previewText: encabezado?.centro_educativo,
              })}
            >
              <span className="meta-label"><Building2 size={12} /> Centro Educativo</span>
              <span className="meta-value">{encabezado?.centro_educativo}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.lugar' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Ubicación',
                selector: 'encabezado.lugar',
                previewText: encabezado?.lugar,
              })}
            >
              <span className="meta-label"><MapPin size={12} /> Ubicación</span>
              <span className="meta-value">{encabezado?.lugar}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.nombre_docente' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Docente',
                selector: 'encabezado.nombre_docente',
                previewText: encabezado?.nombre_docente,
              })}
            >
              <span className="meta-label"><UserCheck size={12} /> Docente</span>
              <span className="meta-value">{encabezado?.nombre_docente}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'metadatos.carrera' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Carrera',
                selector: 'metadatos.carrera',
                previewText: metadatos?.carrera,
              })}
            >
              <span className="meta-label"><GraduationCap size={12} /> Carrera</span>
              <span className="meta-value">{metadatos?.carrera}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'metadatos.subarea_curricular' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Curso',
                selector: 'metadatos.subarea_curricular',
                previewText: metadatos?.subarea_curricular,
              })}
            >
              <span className="meta-label"><BookOpen size={12} /> Curso</span>
              <span className="meta-value">{metadatos?.subarea_curricular}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.grado' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Grado',
                selector: 'encabezado.grado',
                previewText: encabezado?.grado,
              })}
            >
              <span className="meta-label"><Award size={12} /> Grado</span>
              <span className="meta-value">{encabezado?.grado}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.seccion' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Sección',
                selector: 'encabezado.seccion',
                previewText: encabezado?.seccion,
              })}
            >
              <span className="meta-label"><Users size={12} /> Sección</span>
              <span className="meta-value">{encabezado?.seccion}</span>
            </div>

            <div 
              className={`meta-card ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === 'encabezado.duracion' ? 'word-element-selected' : ''}`}
              onClick={(e) => handleElementSelect(e, {
                label: 'Duración',
                selector: 'encabezado.duracion',
                previewText: encabezado?.duracion,
              })}
            >
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
                  <div 
                    className={`tree-root-node ${isFilaActive ? 'active-root' : ''} ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === `competencia-${rowIdx}` ? 'word-element-selected' : ''}`}
                    onClick={(e) => {
                      if (isEditorMode) {
                        handleElementSelect(e, {
                          label: 'Competencia Curricular',
                          selector: `competencia-${rowIdx}`,
                          previewText: fila.competencia,
                        });
                      }
                    }}
                  >
                    <div className="box-title">
                      <Target size={16} color={isFilaActive ? '#2563eb' : '#1d4ed8'} />
                      <span>Competencia Curricular</span>
                    </div>
                    <p className="competency-text">{fila.competencia}</p>
                  </div>

                  <div className="tree-container">
                    <div className={`tree-branches-wrapper ${isFilaActive ? 'trunk-highlighted' : ''}`}>
                      {indicadores.map((ind: any, idx: number) => {
                        const isIndicatorSelected = isFilaActive && selectedNode?.indicatorIdx === idx;

                        return (
                          <div key={idx} className="tree-branch-group">
                            <div
                              className={`tree-branch-node ${isIndicatorSelected ? 'active-branch' : ''} ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === `ind-${rowIdx}-${idx}` ? 'word-element-selected' : ''}`}
                              onClick={(e) => {
                                handleNodeClick(rowIdx, idx);
                                if (isEditorMode) {
                                  handleElementSelect(e, {
                                    label: 'Indicador de Logro',
                                    selector: `ind-${rowIdx}-${idx}`,
                                    previewText: ind.indicador,
                                  });
                                }
                              }}
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
                                  const isContentSelected = isIndicatorSelected && selectedNode?.contentIdx === cIdx;

                                  return (
                                    <div
                                      key={cIdx}
                                      className={`tree-leaf-node ${isContentSelected ? 'active-leaf' : ''} ${isEditorMode ? 'word-editable-element' : ''} ${selectedElement?.selector === `cont-${rowIdx}-${idx}-${cIdx}` ? 'word-element-selected' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNodeClick(rowIdx, idx, cIdx);
                                        if (isEditorMode) {
                                          handleElementSelect(e, {
                                            label: 'Contenido Curricular',
                                            selector: `cont-${rowIdx}-${idx}-${cIdx}`,
                                            previewText: c,
                                          });
                                        }
                                      }}
                                      title="Haz clic para seleccionar contenido"
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
                          const isPhaseSelected = selectedElement?.id === act.id_actividad && selectedElement?.selector?.includes('fase');
                          const isDescSelected = selectedElement?.id === act.id_actividad && !selectedElement?.selector?.includes('fase');

                          return (
                            <tr key={act.id_actividad || actIdx}>
                              <td
                                className={isEditorMode ? `word-editable-element ${isPhaseSelected ? 'word-element-selected' : ''}` : ''}
                                onClick={(e) => handleElementSelect(e, {
                                  id: act.id_actividad,
                                  label: 'Fase Metodológica',
                                  selector: act.id_actividad ? `actividad[id="${act.id_actividad}"].fase` : `actividad[${actIdx}].fase`,
                                  previewText: `Fase: ${faseStr.toUpperCase()}`,
                                })}
                                title={isEditorMode ? "Haz clic para editar la fase de esta actividad" : undefined}
                              >
                                <span className={`phase-pill phase-${faseStr}`}>
                                  Fase: {faseStr.toUpperCase()}
                                </span>
                              </td>
                              <td
                                className={isEditorMode ? `word-editable-element ${isDescSelected ? 'word-element-selected' : ''}` : ''}
                                onClick={(e) => handleElementSelect(e, {
                                  id: act.id_actividad,
                                  label: 'Actividad de Aprendizaje',
                                  selector: act.id_actividad ? `actividad[id="${act.id_actividad}"]` : `actividad[${actIdx}]`,
                                  previewText: act.descripcion,
                                })}
                                title={isEditorMode ? "Haz clic para editar las instrucciones de esta actividad" : undefined}
                              >
                                {act.descripcion}
                              </td>
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

      <ElementEditorPopover
        selected={selectedElement}
        onClose={() => setSelectedElement(null)}
        onSubmit={handleEditorSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
