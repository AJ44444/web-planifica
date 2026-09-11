import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangGraphProvider, useLangGraph } from './context/LangGraphContext';
import type { ViewTabType } from './types';

import { Navbar } from './components/Navbar';
import { AgentStatusPanel } from './components/AgentStatusPanel';
import { ChatMessage } from './components/ChatMessage';
import { LessonPlanView } from './components/Visualizers/LessonPlanView';
import { RubricView } from './components/Visualizers/RubricView';
import { MultimodalView } from './components/Visualizers/MultimodalView';
import { ThreadHistoryView } from './components/Visualizers/ThreadHistoryView';
import { PlanificationsListView } from './components/Visualizers/PlanificationsListView';
import { LoginModal } from './components/LoginModal';

import { getLessonPlanDetail } from './services/api';
import type { LessonPlanDetailResponse } from './types';
import { Send, BookOpen, Paperclip, FileText, X } from 'lucide-react';

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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="initial-loading-container">
        <div className="loading-toast">
          <div className="toast-spinner" />
          <div className="toast-content">
            <span className="toast-title">Validando sesión...</span>
            <span className="toast-subtitle">Por favor espera un momento</span>
          </div>
        </div>
        <style>{`
          .initial-loading-container {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw;
            height: 100vh;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          }

          .loading-toast {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            padding: 0.85rem 1.35rem;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
          }

          .toast-spinner {
            width: 20px;
            height: 20px;
            border: 2.5px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .toast-content {
            display: flex;
            flex-direction: column;
          }

          .toast-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #0f172a;
          }

          .toast-subtitle {
            font-size: 0.75rem;
            color: #64748b;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  const handleTabSelect = (tab: ViewTabType) => {
    if (tab === 'chat' && activeViewTab === 'chat' && (messages.length > 0 || currentThreadId !== null)) {
      resetChatToHero();
    } else {
      setActiveViewTab(tab);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

      if (!isPdf) {
        showErrorNotification('Solo se admiten archivos en formato PDF.');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        showErrorNotification('El archivo supera el tamaño máximo permitido de 10 MB.');
        e.target.value = '';
        return;
      }

      setAttachedFile(file);
      e.target.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputPrompt.trim() && !attachedFile) || isStreaming) return;
    
    let textToSend = inputPrompt.trim();
    if (attachedFile) {
      try {
        const base64Str = await fileToBase64(attachedFile);
        const prefix = textToSend 
          ? `${textToSend}\n\n[Documento CNB: ${attachedFile.name}]\n${base64Str}`
          : `Por favor procesa el siguiente documento PDF del CNB (${attachedFile.name}): ${base64Str}`;
        textToSend = prefix;
      } catch {
        showErrorNotification('No fue posible procesar el archivo PDF adjunto. Por favor, intenta de nuevo.');
      }
    }

    setInputPrompt('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(textToSend);
  };

  return (
    <div className="app-shell">
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
                    <p className="hero-subtitle">Plataforma Educativa Inteligente</p>
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
                  {attachedFile && (
                    <div className="chat-attachment-chip">
                      <FileText size={16} className="chip-icon" />
                      <span className="chip-name">{attachedFile.name}</span>
                      <span className="chip-size">({(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => setAttachedFile(null)}
                        title="Quitar archivo adjunto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="chat-input-row">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn-attach-file"
                      onClick={() => fileInputRef.current?.click()}
                      title="Adjuntar PDF del CNB"
                      disabled={isStreaming}
                    >
                      <Paperclip size={18} />
                    </button>

                    <textarea
                      ref={textareaRef}
                      className="chat-textarea-input"
                      placeholder="Escribe tu pregunta o adjunta un PDF del CNB..."
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
                      disabled={(!inputPrompt.trim() && !attachedFile) || isStreaming}
                    >
                      <Send size={18} />
                      <span>Enviar</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                rubrics={selectedPlanDetail?.instrumentos_evaluacion} 
              />
            )}
            {activeViewTab === 'multimodal' && (
              <MultimodalView 
                multimodals={selectedPlanDetail?.recursos_multimodales} 
              />
            )}
            {activeViewTab === 'history' && <ThreadHistoryView />}
          </div>
        </main>
      </div>

      <style>{`
        .app-shell {
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          overflow: hidden;
        }

        .app-main-layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 68px);
          overflow: hidden;
        }

        .central-workspace {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          overflow: hidden;
        }

        .workspace-scroll-area {
          flex: 1;
          min-height: 0;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .workspace-scroll-area.chat-mode {
          overflow: hidden;
        }

        .chat-view-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          gap: 1rem;
          overflow: hidden;
        }

        .centered-hero-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-logo-box {
          width: 76px;
          height: 76px;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(29, 78, 216, 0.25);
          margin-bottom: 1.25rem;
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .hero-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin-top: 0.4rem;
          font-weight: 500;
        }

        .messages-timeline {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .chat-input-form {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 0.85rem;
          padding: 0.65rem 0.85rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .chat-input-form:focus-within {
          border-color: #2563eb;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.12);
        }

        .chat-attachment-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 0.35rem 0.65rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          align-self: flex-start;
        }

        .chip-icon {
          color: #1d4ed8;
        }

        .chip-name {
          font-weight: 600;
          color: #1e40af;
        }

        .chip-size {
          color: #64748b;
          font-size: 0.725rem;
        }

        .chip-remove-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.15rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
        }

        .chip-remove-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .chat-input-row {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          width: 100%;
        }

        .btn-attach-file {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 0.45rem;
          border-radius: 0.5rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-attach-file:hover {
          color: #1d4ed8;
          background: #f1f5f9;
        }

        .chat-textarea-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.925rem;
          color: #0f172a;
          outline: none;
          padding: 0.25rem 0.25rem;
          resize: none;
          max-height: 140px;
          line-height: 1.5;
          overflow-y: auto;
        }

        .send-btn {
          padding: 0.65rem 1.15rem;
          border-radius: 0.6rem;
          align-self: flex-end;
        }

        /* Responsive Mobile & Tablet Rules */
        @media (max-width: 900px) {
          .app-main-layout {
            height: calc(100vh - 60px);
          }

          .workspace-scroll-area {
            padding: 0.75rem;
          }

          .centered-hero-state {
            padding: 1rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-logo-box {
            width: 60px;
            height: 60px;
          }

          .chat-input-form {
            padding: 0.5rem 0.65rem;
          }
        }
      `}</style>
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
