import React, { useState, useEffect } from 'react';
import { getLessonPlans } from '../../services/api';
import { formatGMT6Date } from '../../utils/dateFormatter';
import { useLangGraph } from '../../context/LangGraphContext';
import type { PlanificacionClase, PlanificationsListViewProps } from '../../types';
import { Layers, ChevronLeft, ChevronRight, Eye, Loader2, Sparkles, RefreshCw } from 'lucide-react';

export const PlanificationsListView: React.FC<PlanificationsListViewProps> = ({ onLoadVisualizers }) => {
  const { showErrorNotification } = useLangGraph();

  const [plans, setPlans] = useState<PlanificacionClase[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const fetchPlans = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const response = await getLessonPlans(currentPage, 10);
      if (response && response.planificaciones) {
        setPlans(response.planificaciones);
        setTotalPages(response.total_paginas || 1);
        setTotalRecords(response.total_registros || response.planificaciones.length);
        setPage(response.pagina_actual || currentPage);
      } else {
        setPlans([]);
      }
    } catch {
      showErrorNotification('No fue posible cargar el historial de planificaciones desde el servidor.');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(page);
  }, [page]);

  const handleLoadVisualizers = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      if (onLoadVisualizers) {
        const success = await onLoadVisualizers(planId);
        if (!success) {
          showErrorNotification('Ocurrió un error al poblar los visualizadores.');
        }
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="planifications-list-wrapper">
      <header className="view-header">
        <div className="title-box">
          <Layers className="header-icon" size={24} />
          <div>
            <h2>Historial de Planificaciones</h2>
            <p className="subtitle">Consulta tus secuencias didácticas registradas y póbllalas en los visualizadores</p>
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
      </header>

      {isLoading ? (
        <div className="loading-state">
          <Loader2 size={36} className="spin-loader" />
          <p>Cargando planificaciones del docente...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={48} className="empty-icon" />
          <h3>No se encontraron planificaciones</h3>
          <p>Genera una nueva planificación desde el chat interactivo para registrarla aquí.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Materia / Subárea</th>
                  <th>Grado & Sección</th>
                  <th>Fecha de Creación (GMT-6)</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="font-semibold text-main">
                      {plan.metadatos?.subarea_curricular || plan.encabezado?.carrera || 'Planificación de Clase'}
                    </td>
                    <td>
                      <span className="grade-badge">
                        {plan.encabezado?.grado || 'General'}{' '}
                        {plan.encabezado?.seccion ? `- Sec. ${plan.encabezado.seccion}` : ''}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatGMT6Date(plan.metadatos?.fecha_creacion)}
                    </td>
                    <td>
                      <span className={`status-badge ${plan.metadatos?.estado || 'finalizado'}`}>
                        {plan.metadatos?.estado === 'en_proceso' ? 'En Proceso' : 'Finalizado'}
                      </span>
                    </td>
                    <td className="text-right">
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

      <style>{`
        .planifications-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .view-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .title-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .header-icon {
          color: #1d4ed8;
          background: #eff6ff;
          padding: 0.4rem;
          border-radius: 0.5rem;
          width: 36px;
          height: 36px;
        }

        .view-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }

        .btn-refresh-plans {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-plans:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #1e293b;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          text-align: center;
          color: #64748b;
          gap: 0.75rem;
        }

        .spin-loader {
          color: #1d4ed8;
          animation: spin 1s linear infinite;
        }

        .empty-icon {
          color: #94a3b8;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .plans-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .plans-table th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .plans-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }

        .plans-table tr:hover {
          background: #f8fafc;
        }

        .text-main {
          color: #0f172a;
          font-weight: 600;
        }

        .text-right {
          text-align: right;
        }

        .grade-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 0.375rem;
          background: #f1f5f9;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .date-cell {
          color: #64748b;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          font-size: 0.775rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.finalizado {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.en_proceso {
          background: #fef3c7;
          color: #92400e;
        }

        .btn-load-visualizers {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.9rem;
          border-radius: 0.5rem;
          border: none;
          background: #1d4ed8;
          color: #ffffff;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(29, 78, 216, 0.2);
        }

        .btn-load-visualizers:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
        }

        .btn-load-visualizers:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
          font-size: 0.875rem;
          color: #64748b;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-pagination {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.825rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-pagination:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-pagination:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
