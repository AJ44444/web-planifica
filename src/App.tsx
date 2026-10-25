import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangGraphProvider, useLangGraph } from './context/LangGraphContext';
import type { ViewTabType } from './types';

import { Navbar } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { AgentStatusPanel } from './components/AgentStatusPanel';
import { ChatMessage } from './components/ChatMessage';

// ponytail: Lazy-load visualizers and login modal so the initial bundle only contains Chat and core layout
const LessonPlanView = React.lazy(() => import('./components/Visualizers/LessonPlanView').then(m => ({ default: m.LessonPlanView })));
const RubricView = React.lazy(() => import('./components/Visualizers/RubricView').then(m => ({ default: m.RubricView })));
const MultimodalView = React.lazy(() => import('./components/Visualizers/MultimodalView').then(m => ({ default: m.MultimodalView })));
const ThreadHistoryView = React.lazy(() => import('./components/Visualizers/ThreadHistoryView').then(m => ({ default: m.ThreadHistoryView })));
const PlanificationsListView = React.lazy(() => import('./components/Visualizers/PlanificationsListView').then(m => ({ default: m.PlanificationsListView })));
const LoginModal = React.lazy(() => import('./components/LoginModal').then(m => ({ default: m.LoginModal })));

import { getLessonPlanDetail } from './services/api';
import type { LessonPlanDetailResponse } from './types';
import { Send, BookOpen, Loader2 } from 'lucide-react';

const ViewFallback = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
    <Loader2 size={32} className="spin-loader" />
  </div>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const MainWorkspaceContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isStreaming, 
    activeViewTab, 
    setActiveViewTab,
    resetChatToHero,
    currentThreadId,
    showErrorNotification,
  } = useLangGraph();

  const [selectedPlanDetail, setSelectedPlanDetail] = useState<LessonPlanDetailResponse | null>(null);
  const [inputPrompt, setInputPrompt] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLoadVisualizers = async (planId: string): Promise<boolean> => {
    try {
      const detail = await getLessonPlanDetail(planId);
      setSelectedPlanDetail(detail);
      setActiveViewTab('plan');
      return true;
    } catch {
      showErrorNotification('Ocurrió un error al poblar los visualizadores.');
      return false;
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatBottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // ponytail: Use instant auto-scroll during live streaming to avoid browser scroll animation thrashing
    scrollToBottom(isStreaming ? 'auto' : 'smooth');
  }, [messages, isStreaming]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={ViewFallback}>
        <LoginModal />
      </React.Suspense>
    );
  }

  const handleTabSelect = (tab: ViewTabType) => {
    if (tab === 'chat' && activeViewTab === 'chat' && (messages.length > 0 || currentThreadId !== null)) {
      resetChatToHero();
    } else {
      setActiveViewTab(tab);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    
    const textToSend = inputPrompt.trim();

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(textToSend);
  };

  return (
    <div className="app-shell">
      <NotificationBanner />
      <Navbar />

      <div className="app-main-layout">
        <AgentStatusPanel 
          activeTab={activeViewTab} 
          onSelectTab={handleTabSelect} 
        />

        <main className="central-workspace">
          <div className={`workspace-scroll-area ${activeViewTab === 'chat' ? 'chat-mode' : ''}`}>
            {activeViewTab === 'chat' && (
              <div className="chat-view-wrapper">
                {messages.length === 0 ? (
                  <div className="centered-hero-state">
                    <div className="hero-logo-box">
                      <BookOpen size={44} color="#ffffff" />
                    </div>
                    <h1 className="hero-title">Planifica</h1>
                    <p className="hero-subtitle">Plataforma Educativa</p>
                  </div>
                ) : (
                  <div className="messages-timeline">
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                      />
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                )}

                <form className="chat-input-form" onSubmit={handleSend}>
                  <div className="chat-input-row">

                    <textarea
                      ref={textareaRef}
                      className="chat-textarea-input"
                      placeholder="Escribe tu pregunta..."
                      value={inputPrompt}
                      onChange={(e) => {
                        setInputPrompt(e.target.value);
                        e.target.style.height = 'auto';
                        const newHeight = Math.min(e.target.scrollHeight, 140);
                        e.target.style.height = `${newHeight}px`;
                        e.target.scrollTop = e.target.scrollHeight;
                        scrollToBottom();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          } else {
                            setTimeout(scrollToBottom, 20);
                          }
                        }
                      }}
                      rows={1}
                      disabled={isStreaming}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary send-btn"
                      disabled={!inputPrompt.trim() || isStreaming}
                    >
                      <Send size={18} />
                      <span>Enviar</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <React.Suspense fallback={ViewFallback}>
              {activeViewTab === 'planifications' && <PlanificationsListView onLoadVisualizers={handleLoadVisualizers} />}
              {activeViewTab === 'plan' && (
                <LessonPlanView 
                  plan={selectedPlanDetail?.planificacion} 
                  rubrics={selectedPlanDetail?.instrumentos_evaluacion} 
                  multimodals={selectedPlanDetail?.recursos_multimodales} 
                />
              )}
              {activeViewTab === 'rubric' && (
                <RubricView 
                  plan={selectedPlanDetail?.planificacion}
                  rubrics={selectedPlanDetail?.instrumentos_evaluacion} 
                  multimodals={selectedPlanDetail?.recursos_multimodales} 
                />
              )}
              {activeViewTab === 'multimodal' && (
                <MultimodalView 
                  plan={selectedPlanDetail?.planificacion}
                  rubrics={selectedPlanDetail?.instrumentos_evaluacion} 
                  multimodals={selectedPlanDetail?.recursos_multimodales} 
                />
              )}
              {activeViewTab === 'history' && <ThreadHistoryView />}
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LangGraphProvider>
          <MainWorkspaceContent />
        </LangGraphProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}