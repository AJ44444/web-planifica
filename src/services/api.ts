import type { ChatMessage, Thread } from '../types';
import { formatGMT6Time } from '../utils/dateFormatter';

const API_BASE_URL = import.meta.env.VITE_LANGGRAPH_API_URL;

export async function fetchWithAutoRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const reqOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  let response = await fetch(url, reqOptions);

  if (response.status === 401 && !url.includes('/auth/')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        response = await fetch(url, reqOptions);
      } else {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    } catch {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  return response;
}

export async function loginToServer(idToken: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    throw new Error('Fallo la autenticación con el servidor');
  }

  return await response.json();
}

export async function verifyServerSession(): Promise<any> {
  let response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          credentials: 'include',
        });
      }
    } catch {
      // Handled below
    }
  }

  if (!response.ok) {
    throw new Error('Sesión no válida o expirada');
  }

  return await response.json();
}

export async function refreshServerSession(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Sesión expirada');
  }

  return await response.json();
}

export async function logoutFromServer(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const okResponse = await fetch(`${API_BASE_URL}/ok`, {
      method: 'GET',
    });
    return okResponse.ok;
  } catch {
    return false;
  }
}

export async function createThread(): Promise<string> {
  const response = await fetchWithAutoRefresh(`${API_BASE_URL}/threads`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error('Fallo la conexión con el servidor');
  }

  const data = await response.json();
  const threadId = data.thread_id || data.id;
  if (!threadId) {
    throw new Error('Fallo la conexión con el servidor');
  }
  return threadId;
}

export async function getThreads(): Promise<Thread[]> {
  const response = await fetchWithAutoRefresh(`${API_BASE_URL}/threads/search`, {
    method: 'POST',
    body: JSON.stringify({ limit: 100, metadata: {} }),
  });

  if (!response.ok) {
    throw new Error('Servidor no disponible en /threads/search');
  }

  const data = await response.json();
  const list = Array.isArray(data) ? data : (data.threads || []);
  if (Array.isArray(list)) {
    return list.map((t: any, idx: number) => ({
      id: t.thread_id || t.id || `thread_${idx}`,
      title: t.title || t.metadata?.title || `Conversación ${list.length - idx}`,
      createdAt: formatGMT6Time(t.created_at || Date.now()),
      messageCount: t.message_count || 0,
    }));
  }
  return [];
}

export async function deleteThread(threadId: string): Promise<boolean> {
  try {
    const response = await fetchWithAutoRefresh(`${API_BASE_URL}/threads/${threadId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getThreadHistory(threadId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetchWithAutoRefresh(`${API_BASE_URL}/threads/${threadId}/history`, {
      method: 'GET',
    });
    if (response.ok) {
      const data = await response.json();
      const loadedMsgs: ChatMessage[] = [];
      const checkpoints = Array.isArray(data) ? data : (data.checkpoints || data.history || []);
      for (const item of checkpoints) {
        if (item.values && item.values.messages) {
          for (const msg of item.values.messages) {
            const isHuman = msg.type === 'human' || msg.role === 'user';
            const isTool = msg.type === 'tool' || msg.role === 'tool';
            const hasToolCalls = Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0;

            if (isHuman) {
              loadedMsgs.push({
                id: msg.id || `msg_${Date.now()}_${Math.random()}`,
                role: 'user',
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                timestamp: msg.timestamp || new Date().toISOString(),
              });
            } else if (!isTool && !hasToolCalls && msg.content) {
              const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
              if (textContent.trim()) {
                loadedMsgs.push({
                  id: msg.id || `msg_${Date.now()}_${Math.random()}`,
                  role: 'assistant',
                  content: textContent,
                  timestamp: msg.timestamp || new Date().toISOString(),
                });
              }
            }
          }
        }
      }
      return loadedMsgs;
    }
  } catch {
    // Fallback gracefully without console logs
  }
  return [];
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullMessage: ChatMessage) => void;
  onError: (error: Error) => void;
}

export async function streamLangGraphRun(
  threadId: string,
  userMessageText: string,
  callbacks: StreamCallbacks
): Promise<void> {
  let fullContent = '';

  try {
    const response = await fetchWithAutoRefresh(`${API_BASE_URL}/threads/${threadId}/runs/stream`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: 'supervisor',
        input: {
          messages: [{ role: 'user', content: userMessageText }],
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Fallo la conexión con el servidor');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);

            // Filter for supervisor state updates or direct message objects (AIMessage without tool_calls)
            const supervisorState = parsed.supervisor_planifica || parsed.main_agent || parsed;
            let targetMsg = null;

            if (supervisorState && supervisorState.messages && Array.isArray(supervisorState.messages)) {
              targetMsg = supervisorState.messages[supervisorState.messages.length - 1];
            } else if (parsed.content || parsed.text) {
              targetMsg = parsed;
            }

            if (targetMsg) {
              const isTool = targetMsg.type === 'tool' || targetMsg.role === 'tool';
              const hasToolCalls = Array.isArray(targetMsg.tool_calls) && targetMsg.tool_calls.length > 0;
              const isUser = targetMsg.type === 'human' || targetMsg.role === 'user';

              if (!isUser && !isTool && !hasToolCalls && targetMsg.content) {
                const textChunk = typeof targetMsg.content === 'string' ? targetMsg.content : JSON.stringify(targetMsg.content);
                if (textChunk) {
                  fullContent += textChunk;
                  callbacks.onToken(textChunk);
                }
              }
            }
          } catch {
            fullContent += dataStr;
            callbacks.onToken(dataStr);
          }
        }
      }
    }

    callbacks.onComplete({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      timestamp: new Date().toISOString(),
    });
  } catch {
    if (fullContent && fullContent.trim().length > 0) {
      callbacks.onComplete({
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      });
    } else {
      callbacks.onError(new Error('Fallo la conexión con el servidor'));
    }
  }
}

export async function getLessonPlans(page: number = 1, limit: number = 10): Promise<any> {
  const response = await fetchWithAutoRefresh(`${API_BASE_URL}/api/lesson-plans?page=${page}&limit=${limit}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('No fue posible obtener el listado de planificaciones');
  }

  return await response.json();
}

export async function getLessonPlanDetail(id: string): Promise<any> {
  const response = await fetchWithAutoRefresh(`${API_BASE_URL}/api/lesson-plans/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('No fue posible obtener los detalles de la planificación');
  }

  return await response.json();
}
