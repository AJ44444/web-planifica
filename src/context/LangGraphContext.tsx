import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  ChatMessage, 
  Thread, 
  PlanificacionClase,
  InstrumentoEvaluacion,
  RecursoMultimodal
} from '../types';
import { createThread, getThreads, getThreadHistory, deleteThread, streamLangGraphRun, checkServerHealth } from '../services/api';
import { parseAgentResponse, isFullPlanResponse } from '../utils/parser';
import { useAuth } from './AuthContext';

interface LangGraphContextType {
  currentThreadId: string | null;
  threads: Thread[];
  messages: ChatMessage[];
  isStreaming: boolean;
  isServerOnline: boolean;
  activeViewTab: 'chat' | 'plan' | 'rubric' | 'multimodal' | 'history';
  currentPlanData: PlanificacionClase | null;
  currentRubricData: InstrumentoEvaluacion | null;
  currentMultimodalData: RecursoMultimodal[] | null;
  setActiveViewTab: (tab: 'chat' | 'plan' | 'rubric' | 'multimodal' | 'history') => void;
  sendMessage: (text: string, attachedFile?: File | null) => Promise<void>;
  createNewThread: () => Promise<string>;
  selectThread: (threadId: string) => void;
  deleteThreadById: (threadId: string) => Promise<void>;
  resetChatToHero: () => void;
  checkHealth: () => Promise<void>;
}

const LangGraphContext = createContext<LangGraphContextType | undefined>(undefined);

export const LangGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'chat' | 'plan' | 'rubric' | 'multimodal' | 'history'>('chat');

  // Dynamic Pydantic structured data states
  const [currentPlanData, setCurrentPlanData] = useState<PlanificacionClase | null>(null);
  const [currentRubricData, setCurrentRubricData] = useState<InstrumentoEvaluacion | null>(null);
  const [currentMultimodalData, setCurrentMultimodalData] = useState<RecursoMultimodal[] | null>(null);

  const checkHealth = async () => {
    const online = await checkServerHealth();
    setIsServerOnline(online);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Upon authentication, load existing threads without automatically selecting or loading the last conversation
  useEffect(() => {
    const initThreads = async () => {
      if (isAuthenticated && token) {
        const loadedThreads = await getThreads();
        setThreads(loadedThreads || []);
        setCurrentThreadId(null);
        setMessages([]);
        setCurrentPlanData(null);
        setCurrentRubricData(null);
        setCurrentMultimodalData(null);
      }
    };
    initThreads();
  }, [isAuthenticated, token]);

  const createNewThread = async (): Promise<string> => {
    const newId = await createThread();
    const newThread: Thread = {
      id: newId,
      title: `Conversación ${threads.length + 1}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageCount: 0,
    };
    setThreads((prev) => [newThread, ...prev]);
    setCurrentThreadId(newId);
    setMessages([]);
    setCurrentPlanData(null);
    setCurrentRubricData(null);
    setCurrentMultimodalData(null);
    return newId;
  };

  const selectThread = async (threadId: string) => {
    setCurrentThreadId(threadId);
    const history = await getThreadHistory(threadId);
    const cleanHistory = history.filter((msg) => msg.role === 'user' || (msg.content && msg.content.trim()));

    // Check history messages for full plan response format
    let foundPlan = false;
    const processedHistory = cleanHistory.map((msg) => {
      if (msg.role === 'assistant' && msg.content) {
        const isFull = isFullPlanResponse(msg.content);
        if (isFull) {
          if (!foundPlan) {
            const parsed = parseAgentResponse(msg.content);
            setCurrentPlanData(parsed.plan || null);
            setCurrentRubricData(parsed.rubric || null);
            setCurrentMultimodalData(parsed.multimodal || null);
            foundPlan = true;
          }
          return { ...msg, isFullPlanResponse: true };
        }
      }
      return msg;
    });

    if (!foundPlan) {
      setCurrentPlanData(null);
      setCurrentRubricData(null);
      setCurrentMultimodalData(null);
    }
    setMessages(processedHistory);
  };

  const deleteThreadById = async (threadId: string) => {
    await deleteThread(threadId);
    const remaining = threads.filter((t) => t.id !== threadId);
    setThreads(remaining);
    if (currentThreadId === threadId) {
      if (remaining.length > 0) {
        await selectThread(remaining[0].id);
      } else {
        await createNewThread();
      }
    }
  };

  const resetChatToHero = () => {
    setCurrentThreadId(null);
    setMessages([]);
    setCurrentPlanData(null);
    setCurrentRubricData(null);
    setCurrentMultimodalData(null);
    setActiveViewTab('chat');
  };

  const sendMessage = async (text: string, attachedFile?: File | null) => {
    if ((!text.trim() && !attachedFile) || isStreaming) return;

    // Ensure mandatory thread_id exists before starting graph execution
    let activeThreadId = currentThreadId;
    if (!activeThreadId) {
      activeThreadId = await createNewThread();
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

    await streamLangGraphRun(
      activeThreadId,
      text,
      {
        onToken: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamMsgId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        },
        onComplete: (finalMessage) => {
          const isFullPlan = isFullPlanResponse(finalMessage.content);

          if (isFullPlan) {
            const parsedData = parseAgentResponse(finalMessage.content);
            setCurrentPlanData(parsedData.plan || null);
            setCurrentRubricData(parsedData.rubric || null);
            setCurrentMultimodalData(parsedData.multimodal || null);
          } else if (finalMessage.structuredData) {
            setCurrentPlanData(finalMessage.structuredData.plan || null);
            setCurrentRubricData(finalMessage.structuredData.rubric || null);
            setCurrentMultimodalData(finalMessage.structuredData.multimodal || null);
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamMsgId
                ? { ...finalMessage, id: streamMsgId, isFullPlanResponse: isFullPlan }
                : msg
            )
          );
          setIsStreaming(false);
        },
        onError: () => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === streamMsgId) {
                // If content was already received from the server, keep it and do not overwrite with error
                if (msg.content && msg.content.trim().length > 0) {
                  const isFull = isFullPlanResponse(msg.content);
                  if (isFull) {
                    const parsedData = parseAgentResponse(msg.content);
                    setCurrentPlanData(parsedData.plan || null);
                    setCurrentRubricData(parsedData.rubric || null);
                    setCurrentMultimodalData(parsedData.multimodal || null);
                  }
                  return { ...msg, isFullPlanResponse: isFull };
                }
                return {
                  ...msg,
                  content: '⚠️ No fue posible procesar tu consulta con el servidor de la plataforma. Por favor intenta de nuevo en unos momentos.',
                };
              }
              return msg;
            })
          );
          setIsStreaming(false);
        },
      },
      attachedFile
    );
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
        currentPlanData,
        currentRubricData,
        currentMultimodalData,
        setActiveViewTab,
        sendMessage,
        createNewThread,
        selectThread,
        deleteThreadById,
        resetChatToHero,
        checkHealth,
      }}
    >
      {children}
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
