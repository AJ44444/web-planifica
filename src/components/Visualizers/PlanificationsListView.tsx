import React, { useState, useEffect } from 'react';
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

  const fetchPlans = async (currentPage: number) => {
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
                  <th className="text-right">Acciones</th>
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
          font-size: 0.85rem;
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

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          text-align: center;
          color: #64748b;
          gap: 0.75rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          text-align: center;
          gap: 1.25rem;
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -2px rgba(29, 78, 216, 0.08);
          min-height: 320px;
        }

        .empty-state-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.5;
          max-width: 520px;
          margin: 0;
        }

        .btn-go-chat {
          background: #1d4ed8;
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
        }

        .btn-go-chat:hover {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.3);
        }

        .spin-loader {
          color: #1d4ed8;
          animation: spin 1s linear infinite;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .plans-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #e2e8f0;
          border-radius: 0.65rem;
          overflow: hidden;
        }

        .plans-table th {
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

        .plans-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.825rem;
          color: #0f172a;
          line-height: 1.45;
          vertical-align: middle;
        }

        .plans-table tr:last-child td {
          border-bottom: none;
        }

        .plans-table tr:nth-child(odd) td {
          background: #ffffff;
        }

        .plans-table tr:nth-child(even) td {
          background: #f8fafc;
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
          display: inline-block;
          padding: 0.3rem 0.65rem;
          border-radius: 0.375rem;
          background: #f1f5f9;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
          max-width: 240px;
          line-height: 1.45;
          text-align: left;
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
