import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  ChatMessage, 
  Thread
} from '../types';
import { 
  createThread, 
  getThreads, 
  getThreadHistory, 
  deleteThread, 
  streamLangGraphRun, 
  checkServerHealth
} from '../services/api';
import { useAuth } from './AuthContext';
import { ErrorModal } from '../components/ErrorModal';

export type ViewTabType = 'chat' | 'planifications' | 'plan' | 'rubric' | 'multimodal' | 'history';

interface LangGraphContextType {
  currentThreadId: string | null;
  threads: Thread[];
  messages: ChatMessage[];
  isStreaming: boolean;
  isServerOnline: boolean;
  activeViewTab: ViewTabType;
  errorModalMessage: string | null;
  setActiveViewTab: (tab: ViewTabType) => void;
  sendMessage: (text: string) => Promise<void>;
  createNewThread: () => Promise<string | null>;
  selectThread: (threadId: string) => void;
  deleteThreadById: (threadId: string) => Promise<void>;
  resetChatToHero: () => void;
  checkHealth: () => Promise<void>;
  showErrorNotification: (msg: string) => void;
  clearErrorNotification: () => void;
}

const LangGraphContext = createContext<LangGraphContextType | undefined>(undefined);

export const LangGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const [activeViewTab, setActiveViewTab] = useState<ViewTabType>('chat');
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const showErrorNotification = (msg: string) => {
    setErrorModalMessage(msg);
  };

  const clearErrorNotification = () => {
    setErrorModalMessage(null);
  };

  const checkHealth = async () => {
    const isOk = await checkServerHealth();
    setIsServerOnline(isOk);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    const initThreads = async () => {
      if (isAuthenticated && token) {
        const loadedThreads = await getThreads();
        setThreads(loadedThreads || []);
        setCurrentThreadId(null);
        setMessages([]);
      }
    };
    initThreads();
  }, [isAuthenticated, token]);

  const createNewThread = async (): Promise<string | null> => {
    try {
      const newId = await createThread();
      if (!newId) {
        setIsServerOnline(false);
        showErrorNotification('Falló la conexión con el servidor. No fue posible crear la conversación.');
        return null;
      }
      setIsServerOnline(true);
      const newThread: Thread = {
        id: newId,
        title: `Conversación ${threads.length + 1}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messageCount: 0,
      };
      setThreads((prev) => [newThread, ...prev]);
      setCurrentThreadId(newId);
      setMessages([]);
      return newId;
    } catch {
      setIsServerOnline(false);
      showErrorNotification('Falló la conexión con el servidor. El servidor no se encuentra disponible.');
      return null;
    }
  };

  const selectThread = async (threadId: string) => {
    try {
      setCurrentThreadId(threadId);
      const history = await getThreadHistory(threadId);
      const cleanHistory = history.filter((msg) => msg.role === 'user' || (msg.content && msg.content.trim()));
      setMessages(cleanHistory);
    } catch {
      showErrorNotification('Falló la conexión con el servidor. No fue posible cargar la conversación.');
    }
  };

  const deleteThreadById = async (threadId: string) => {
    try {
      const success = await deleteThread(threadId);
      if (!success) {
        showErrorNotification('Falló la conexión con el servidor. No fue posible eliminar la conversación.');
        return;
      }
      const remaining = threads.filter((t) => t.id !== threadId);
      setThreads(remaining);
      if (currentThreadId === threadId) {
        if (remaining.length > 0) {
          await selectThread(remaining[0].id);
        } else {
          resetChatToHero();
        }
      }
    } catch {
      showErrorNotification('Falló la conexión con el servidor. No fue posible eliminar la conversación.');
    }
  };

  const resetChatToHero = () => {
    setCurrentThreadId(null);
    setMessages([]);
    setActiveViewTab('chat');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let activeThreadId = currentThreadId;
    if (!activeThreadId) {
      activeThreadId = await createNewThread();
    }

    if (!activeThreadId) {
      setIsServerOnline(false);
      showErrorNotification('Falló la conexión con el servidor. El servidor no se encuentra disponible.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const streamMsgId = `ast_${Date.now()}`;
    const initialStreamMsg: ChatMessage = {
      id: streamMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, initialStreamMsg]);

    await streamLangGraphRun(activeThreadId, text, {
      onToken: (chunk) => {
        setIsServerOnline(true);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      onComplete: (finalMessage) => {
        setIsServerOnline(true);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamMsgId ? { ...finalMessage, id: streamMsgId } : msg
          )
        );
        setIsStreaming(false);
      },
      onError: () => {
        setIsServerOnline(false);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === streamMsgId) {
              if (msg.content && msg.content.trim().length > 0) {
                return msg;
              }
              return {
                ...msg,
                content: '⚠️ No fue posible procesar tu consulta. El servidor no se encuentra disponible.',
              };
            }
            return msg;
          })
        );
        setIsStreaming(false);
        showErrorNotification('Falló la conexión con el servidor. El servidor no se encuentra disponible.');
      },
    });
  };

  return (
    <LangGraphContext.Provider
      value={{
        currentThreadId,
        threads,
        messages,
        isStreaming,
        isServerOnline,
        activeViewTab,
        errorModalMessage,
        setActiveViewTab,
        sendMessage,
        createNewThread,
        selectThread,
        deleteThreadById,
        resetChatToHero,
        checkHealth,
        showErrorNotification,
        clearErrorNotification,
      }}
    >
      {children}
      <ErrorModal
        isOpen={!!errorModalMessage}
        message={errorModalMessage || ''}
        onClose={clearErrorNotification}
      />
    </LangGraphContext.Provider>
  );
};

export const useLangGraph = (): LangGraphContextType => {
  const context = useContext(LangGraphContext);
  if (!context) {
    throw new Error('useLangGraph must be used within a LangGraphProvider');
  }
  return context;
};
