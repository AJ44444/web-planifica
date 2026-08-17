import type { 
  PlanificacionClase, 
  InstrumentoEvaluacion, 
  RecursoMultimodal
} from '../types';

export interface ExtractedStructuredData {
  plan?: PlanificacionClase;
  rubric?: InstrumentoEvaluacion;
  multimodal?: RecursoMultimodal[];
}

export function isFullPlanResponse(rawText: string): boolean {
  if (!rawText) return false;
  const lower = rawText.toLowerCase();
  return lower.includes('"planificacion"') && lower.includes('"desarrollo_curricular"') && 
    (lower.includes('"instrumentos_evaluacion"') || lower.includes('"recursos_multimodales"'));
}

export function parseAgentResponse(rawText: string): ExtractedStructuredData {
  const result: ExtractedStructuredData = {};
  if (!rawText) return result;

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace <= firstBrace) return result;

  try {
    const parsedObj = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
    if (!parsedObj || typeof parsedObj !== 'object') return result;

    const planData = parsedObj.planificacion || (parsedObj.encabezado && parsedObj.desarrollo_curricular ? parsedObj : null);
    if (planData?.encabezado && Array.isArray(planData.desarrollo_curricular)) {
      if (parsedObj.planificacion?.metadatos) {
        if (!planData.encabezado.carrera && parsedObj.planificacion.metadatos.carrera) {
          planData.encabezado.carrera = parsedObj.planificacion.metadatos.carrera;
        }
        if (!planData.encabezado.curso && parsedObj.planificacion.metadatos.subarea_curricular) {
          planData.encabezado.curso = parsedObj.planificacion.metadatos.subarea_curricular;
        }
      }
      result.plan = planData as PlanificacionClase;
    }

    const instList = parsedObj.instrumentos_evaluacion || parsedObj.instrumentos;
    if (Array.isArray(instList) && instList.length > 0) {
      const firstTool = instList[0];
      result.rubric = {
        tipo: firstTool.tipo || 'rubrica',
        titulo: firstTool.titulo || 'Herramientas de Evaluación',
        instrumento_generado: firstTool.instrumento_generado || {
          escala: ['Excelente', 'Satisfactorio', 'En proceso', 'Necesita apoyo'],
          criterios: []
        },
        herramientas: instList.map((tool: any) => ({
          tipo: tool.tipo || 'rubrica',
          titulo: tool.titulo || 'Instrumento de Evaluación',
          escala: tool.instrumento_generado?.escala || ['Excelente', 'Satisfactorio', 'En proceso', 'Necesita apoyo'],
          criterios: tool.instrumento_generado?.criterios || []
        }))
      };
    } else if (parsedObj.instrumento_generado || (parsedObj.tipo && parsedObj.criterios)) {
      result.rubric = parsedObj as InstrumentoEvaluacion;
    }

    const resData = parsedObj.recursos_multimodales || parsedObj.multimodal || parsedObj.recursos;
    if (Array.isArray(resData)) {
      result.multimodal = resData as RecursoMultimodal[];
    } else if (resData && typeof resData === 'object') {
      result.multimodal = [resData as RecursoMultimodal];
    }
  } catch {
    // Silent catch for incomplete/non-JSON text
  }

  return result;
}
