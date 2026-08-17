export type SubAgentType = 
  | 'pdf_processor' 
  | 'class_planner' 
  | 'evaluator' 
  | 'multimodal' 
  | 'specialized';

export interface User {
  google_id: string;
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

// ----------------------------------------------------
// 1. PLANIFICADOR DE CLASES
// ----------------------------------------------------
export interface EncabezadoPlan {
  centro_educativo: string;
  lugar: string;
  nombre_docente: string;
  carrera?: string;
  curso?: string;
  grado: string;
  seccion: string;
  duracion: number | string;
}

export interface IndicadorPlanItem {
  indicador: string;
  contenidos: string[];
}

export interface ActividadAprendizaje {
  id_actividad: number;
  fase: 'inicio' | 'desarrollo' | 'cierre';
  descripcion: string;
}

export interface FilaCurricularPlan {
  id_fila: number;
  titulo_fila?: string;
  competencia: string;
  indicadores_logro: IndicadorPlanItem[];
  actividades_aprendizaje: ActividadAprendizaje[];
}

export interface PlanificacionClase {
  encabezado: EncabezadoPlan;
  desarrollo_curricular: FilaCurricularPlan[];
}

// ----------------------------------------------------
// 3. SUBAGENTE 3: INSTRUMENTOS DE EVALUACIÓN
// ----------------------------------------------------
export interface CriterioEvaluacion {
  nombre: string;
  definiciones: string[];
}

export interface InstrumentoGeneradoDetail {
  escala: string[];
  criterios: CriterioEvaluacion[];
}

export interface EvaluacionToolItem {
  tipo: 'lista_cotejo' | 'rubrica' | 'escala_rango';
  titulo: string;
  escala: string[];
  criterios: CriterioEvaluacion[];
}

export interface InstrumentoEvaluacion {
  id_planificacion?: string;
  id_fila_curricular?: number;
  id_actividad?: number;
  tipo: 'lista_cotejo' | 'rubrica' | 'escala_rango';
  titulo: string;
  instrumento_generado: InstrumentoGeneradoDetail;
  herramientas?: EvaluacionToolItem[];
}

// ----------------------------------------------------
// 4. SUBAGENTE 4: RECURSOS MULTIMODALES
// ----------------------------------------------------
export interface RecursoMultimodal {
  id_planificacion?: string;
  id_fila_curricular?: number;
  id_actividad?: number;
  tipo: 'video' | 'imagen' | 'audio' | 'documento' | 'sitio_web';
  titulo: string;
  url: string;
  busqueda_query?: string;
  descripcion_recurso?: string;
  descripcion_uso?: string;
}

// ----------------------------------------------------
// CHAT & CORE INTERFACES
// ----------------------------------------------------
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentType?: SubAgentType;
  agentName?: string;
  isFullPlanResponse?: boolean;
  structuredData?: {
    plan?: PlanificacionClase;
    rubric?: InstrumentoEvaluacion;
    multimodal?: RecursoMultimodal[];
  };
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

export interface PDFUploadProgress {
  isUploading: boolean;
  progress: number;
  filename?: string;
  extractedNodes?: number;
  statusText?: string;
}
