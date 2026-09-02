import type { ChatMessage, Thread } from '../types';
import { parseAgentResponse } from '../utils/parser';

const API_BASE_URL = import.meta.env.VITE_LANGGRAPH_API_URL;

/**
 * Executes fetch with automatic HttpOnly Cookie transmission (credentials: 'include')
 * and handles HTTP 401 Unauthorized via /auth/refresh.
 */
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
        // Retry original request with newly updated cookie
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

/**
 * Authenticates teacher via Google ID Token (POST /auth/login)
 * Sets HttpOnly cookies: access_token and refresh_token
 */
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

/**
 * Renews access_token cookie using refresh_token cookie (POST /auth/refresh)
 */
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

/**
 * Closes server session and clears HttpOnly cookies (POST /auth/logout)
 */
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

/**
 * Validates server health on /ok route
 */
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
      createdAt: t.created_at
        ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

            // Render HumanMessages and final supervisor AIMessages without tool_calls only
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

    const structuredData = parseAgentResponse(fullContent);

    callbacks.onComplete({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      timestamp: new Date().toISOString(),
      structuredData,
    });
  } catch {
    if (fullContent && fullContent.trim().length > 0) {
      const structuredData = parseAgentResponse(fullContent);
      callbacks.onComplete({
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        structuredData,
      });
    } else {
      callbacks.onError(new Error('Fallo la conexión con el servidor'));
    }
  }
}
