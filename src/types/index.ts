export interface User {
  id_usuario: string;
  email: string;
  nombres: string;
  rol?: string;
}

export interface MetadatosPlan {
  carrera?: string;
  subarea_curricular?: string;
  fecha_creacion?: string;
  estado?: string;
  id_usuario?: string;
}

export interface EncabezadoPlan {
  centro_educativo?: string;
  lugar?: string;
  nombre_docente?: string;
  carrera?: string;
  curso?: string;
  grado?: string;
  seccion?: string;
  duracion?: string;
  cantidad_periodos?: number;
  duracion_periodos?: number;
}

export interface ActividadAprendizaje {
  id_actividad: number;
  fase: 'inicio' | 'desarrollo' | 'cierre';
  descripcion: string;
}

export interface IndicadorPlanItem {
  indicador: string;
  contenidos: string[];
}

export interface FilaCurricularPlan {
  id_fila: number;
  titulo_fila?: string;
  competencia: string;
  indicadores_logro: IndicadorPlanItem[];
  actividades_aprendizaje: ActividadAprendizaje[];
}

export interface PlanificacionClase {
  _id?: string;
  id_usuario?: string;
  metadatos?: MetadatosPlan;
  encabezado: EncabezadoPlan;
  desarrollo_curricular?: FilaCurricularPlan[];
}

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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentName?: string;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

export interface LessonPlansResponse {
  status: string;
  total_registros: number;
  total_paginas: number;
  pagina_actual: number;
  registros_por_pagina: number;
  planificaciones: PlanificacionClase[];
}

export interface LessonPlanDetailResponse {
  status: string;
  planificacion?: PlanificacionClase;
  instrumentos_evaluacion?: InstrumentoEvaluacion[];
  recursos_multimodales?: RecursoMultimodal[];
}

export interface VisualizadoresData {
  plan?: PlanificacionClase | null;
  rubrics?: InstrumentoEvaluacion[] | null;
  multimodals?: RecursoMultimodal[] | null;
}

export type ViewTabType = 'chat' | 'planifications' | 'plan' | 'rubric' | 'multimodal' | 'history';

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullMessage: ChatMessage) => void;
  onError: (error: Error) => void;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  loginWithToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface LangGraphContextType {
  currentThreadId: string | null;
  threads: Thread[];
  messages: ChatMessage[];
  isStreaming: boolean;
  isServerOnline: boolean;
  activeViewTab: ViewTabType;
  setActiveViewTab: (tab: ViewTabType) => void;
  sendMessage: (text: string) => Promise<void>;
  createNewThread: () => Promise<string | null>;
  selectThread: (threadId: string) => void;
  deleteThreadById: (threadId: string) => Promise<void>;
  resetChatToHero: () => void;
  checkHealth: () => Promise<void>;
  showErrorNotification: (msg: string) => void;
}

export interface AgentStatusPanelProps {
  activeTab: ViewTabType;
  onSelectTab: (tab: ViewTabType) => void;
}

export interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export interface PlanificationsListViewProps {
  onLoadVisualizers?: (planId: string) => Promise<boolean>;
}
