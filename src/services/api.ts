import Cookies from 'js-cookie';
import type { SubAgentType, ChatMessage, Thread } from '../types';
import { parseAgentResponse } from '../utils/parser';

const API_BASE_URL = import.meta.env.VITE_LANGGRAPH_API_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('google_id_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/ok`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function createThread(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    if (response.ok) {
      const data = await response.json();
      return data.thread_id || data.id || `thread_${Date.now()}`;
    }
  } catch (error) {
    console.warn('LangGraph server unreachable:', error);
  }
  return `thread_local_${Date.now()}`;
}

export async function getThreads(): Promise<Thread[]> {
  try {
    // Search threads according to como_consultar_threads.md (POST /threads/search)
    const response = await fetch(`${API_BASE_URL}/threads/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ limit: 100, metadata: {} }),
    });

    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.threads || []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((t: any, idx: number) => ({
          id: t.thread_id || t.id || `thread_${idx}`,
          title: t.title || t.metadata?.title || `Conversación ${list.length - idx}`,
          createdAt: t.created_at
            ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messageCount: t.message_count || 0,
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to fetch threads via POST /threads/search:', error);
  }
  return [];
}

export async function deleteThread(threadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.warn(`Failed to delete thread ${threadId}:`, error);
    return false;
  }
}

export async function getThreadHistory(threadId: string): Promise<ChatMessage[]> {
  try {
    // Get thread history according to como_consultar_threads.md (GET /threads/{thread_id}/history)
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      const loadedMsgs: ChatMessage[] = [];
      const checkpoints = Array.isArray(data) ? data : (data.checkpoints || data.history || []);
      for (const item of checkpoints) {
        if (item.values && item.values.messages) {
          for (const msg of item.values.messages) {
            const role = msg.type === 'human' || msg.role === 'user' ? 'user' : 'assistant';
            loadedMsgs.push({
              id: msg.id || `msg_${Date.now()}_${Math.random()}`,
              role,
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              timestamp: msg.timestamp || new Date().toISOString(),
              agentType: msg.agent_type || 'class_planner',
              agentName: msg.agent_name || 'Planifica',
            });
          }
        }
      }
      return loadedMsgs;
    }
  } catch (error) {
    console.warn('Failed to fetch thread history:', error);
  }
  return [];
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onAgentChange?: (agentType: SubAgentType, agentName: string) => void;
  onComplete: (fullMessage: ChatMessage) => void;
  onError: (error: Error) => void;
}

export async function streamLangGraphRun(
  threadId: string,
  userMessageText: string,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/runs/stream`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        assistant_id: 'supervisor',
        input: {
          messages: [{ role: 'user', content: userMessageText }],
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let currentAgent: SubAgentType = 'class_planner';
    let currentAgentName = 'Planificador de Clases';
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

            // Detect active subagent from event payload
            if (parsed.node || parsed.event) {
              const nodeName = String(parsed.node || parsed.event).toLowerCase();
              if (nodeName.includes('pdf') || nodeName.includes('cnb')) {
                currentAgent = 'pdf_processor';
                currentAgentName = 'Procesador de PDF CNB';
              } else if (nodeName.includes('plan') || nodeName.includes('clase')) {
                currentAgent = 'class_planner';
                currentAgentName = 'Planificador de Clases';
              } else if (nodeName.includes('eval') || nodeName.includes('rubric')) {
                currentAgent = 'evaluator';
                currentAgentName = 'Instrumentos de Evaluación';
              } else if (nodeName.includes('multi') || nodeName.includes('media')) {
                currentAgent = 'multimodal';
                currentAgentName = 'Recursos Multimodales';
              } else if (nodeName.includes('query') || nodeName.includes('consulta')) {
                currentAgent = 'specialized';
                currentAgentName = 'Consultas Especializadas';
              }
              callbacks.onAgentChange?.(currentAgent, currentAgentName);
            }

            // Extract text chunk strictly from assistant / AI messages
            let textChunk = '';
            if (typeof parsed === 'string') {
              textChunk = parsed;
            } else if (parsed.content && parsed.role !== 'user' && parsed.type !== 'human') {
              textChunk = typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content);
            } else if (parsed.messages && Array.isArray(parsed.messages)) {
              const lastMsg = parsed.messages[parsed.messages.length - 1];
              if (lastMsg && lastMsg.content && lastMsg.role !== 'user' && lastMsg.type !== 'human') {
                textChunk = lastMsg.content;
              }
            }

            if (textChunk) {
              fullContent += textChunk;
              callbacks.onToken(textChunk);
            }
          } catch {
            fullContent += dataStr;
            callbacks.onToken(dataStr);
          }
        }
      }
    }

    // Parse structured data from complete streamed output
    const structuredData = parseAgentResponse(fullContent);

    callbacks.onComplete({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      timestamp: new Date().toISOString(),
      agentType: currentAgent,
      agentName: currentAgentName,
      structuredData,
    });
  } catch (err: any) {
    console.error('SSE stream error:', err);
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
