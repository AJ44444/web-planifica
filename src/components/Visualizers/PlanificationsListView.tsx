import React, { useState, useEffect, useCallback } from 'react';
import { getLessonPlans } from '../../services/api';
import { formatGMT6Date } from '../../utils/dateFormatter';
import { useLangGraph } from '../../context/LangGraphContext';
import type { PlanificacionClase, PlanificationsListViewProps } from '../../types';
import { Layers, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw } from 'lucide-react';

export const PlanificationsListView: React.FC<PlanificationsListViewProps> = ({ onLoadVisualizers }) => {
  const { showErrorNotification, setActiveViewTab } = useLangGraph();

  const [plans, setPlans] = useState<PlanificacionClase[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const fetchPlans = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const response = await getLessonPlans(currentPage, 10);
      if (response && response.planificaciones) {
        setPlans(response.planificaciones);
        setTotalPages(response.total_paginas);
        setTotalRecords(response.total_registros);
        setPage(response.pagina_actual);
      } else {
        setPlans([]);
      }
    } catch {
      showErrorNotification('No fue posible cargar el historial de planificaciones desde el servidor.');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [showErrorNotification]);

  useEffect(() => {
    fetchPlans(page);
  }, [page, fetchPlans]);

  const handleLoadVisualizers = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      if (onLoadVisualizers) {
        await onLoadVisualizers(planId);
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="planifications-list-wrapper">
      <div className="visualizer-header">
        <div className="title-row">
          <div className="icon-badge">
            <Layers size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 className="visualizer-title">Historial de Planificaciones</h2>
            <p className="visualizer-subtitle">Consulta tus secuencias didácticas registradas</p>
          </div>
        </div>
        <button
          className="btn-refresh-plans"
          onClick={() => fetchPlans(page)}
          disabled={isLoading}
          title="Actualizar lista"
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <Loader2 size={36} className="spin-loader" />
          <p>Cargando planificaciones del docente...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">
            No hay planes registrados, pásate por el chat y dale vida a tus próximos planes.
          </h3>
          <button
            className="btn-go-chat"
            onClick={() => setActiveViewTab('chat')}
          >
            Iniciar chat
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Grado & Sección</th>
                  <th>Fecha de Creación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="font-semibold text-main">
                      {plan.metadatos?.subarea_curricular}
                    </td>
                    <td>
                      <span className="grade-badge">
                        {plan.encabezado?.grado}{' '}
                        {plan.encabezado?.seccion}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatGMT6Date(plan.metadatos?.fecha_creacion)}
                    </td>
                    <td>
                      <span className={`status-badge ${plan.metadatos?.estado}`}>
                        {plan.metadatos?.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-load-visualizers"
                        onClick={() => plan._id && handleLoadVisualizers(plan._id)}
                        disabled={!plan._id || loadingPlanId === plan._id}
                      >
                        {loadingPlanId === plan._id ? (
                          <>
                            <Loader2 size={16} className="spin" />
                            <span>Cargando...</span>
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            <span>Cargar Visualizadores</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-bar">
            <span className="pagination-info">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({totalRecords} planificaciones)
            </span>
            <div className="pagination-buttons">
              <button
                className="btn-pagination"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
              <button
                className="btn-pagination"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};