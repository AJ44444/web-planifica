import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangGraphProvider, useLangGraph } from './context/LangGraphContext';

import { Navbar } from './components/Navbar';
import { AgentStatusPanel } from './components/AgentStatusPanel';
import { ChatMessage } from './components/ChatMessage';
import { LessonPlanView } from './components/Visualizers/LessonPlanView';
import { RubricView } from './components/Visualizers/RubricView';
import { MultimodalView } from './components/Visualizers/MultimodalView';
import { ThreadHistoryView } from './components/Visualizers/ThreadHistoryView';
import { LoginModal } from './components/LoginModal';

import { Send, MessageSquare, BookOpen, ClipboardCheck, Video, History, Paperclip, FileText, X } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const MainWorkspaceContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isStreaming, 
    activeViewTab, 
    setActiveViewTab,
    currentPlanData,
    currentRubricData,
    currentMultimodalData,
    resetChatToHero,
    currentThreadId,
  } = useLangGraph();

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="full-loader">
        <div className="loader-spinner animate-spin" />
        <span>Cargando credenciales de sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  const handleTabSelect = (tab: 'chat' | 'plan' | 'rubric' | 'multimodal' | 'history') => {
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
        alert('Solo se admiten archivos en formato PDF.');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        alert('El archivo supera el tamaño máximo permitido de 10 MB.');
        e.target.value = '';
        return;
      }

      setAttachedFile(file);
      e.target.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputPrompt.trim() && !attachedFile) || isStreaming) return;
    
    const fileToUpload = attachedFile;
    let textToSend = inputPrompt.trim();
    if (fileToUpload) {
      const fileNote = `[Archivo CNB Adjunto: ${fileToUpload.name}]`;
      textToSend = textToSend ? `${textToSend}\n\n${fileNote}` : `Consultando con documento CNB adjunto: ${fileToUpload.name}`;
    }

    setInputPrompt('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(textToSend, fileToUpload);
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-main-layout">
        {/* Sidebar with Navigation */}
        <AgentStatusPanel 
          activeTab={activeViewTab} 
          onSelectTab={handleTabSelect} 
        />

        {/* Central Workspace Area */}
        <main className="central-workspace">
          {/* View Tab Selector Bar */}
          <div className="workspace-tab-bar">
            <button
              className={`workspace-tab ${activeViewTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleTabSelect('chat')}
            >
              <MessageSquare size={16} /> Chat
            </button>
            <button
              className={`workspace-tab ${activeViewTab === 'plan' ? 'active' : ''}`}
              onClick={() => handleTabSelect('plan')}
            >
              <BookOpen size={16} /> Visualizador de Plan
            </button>
            <button
              className={`workspace-tab ${activeViewTab === 'rubric' ? 'active' : ''}`}
              onClick={() => handleTabSelect('rubric')}
            >
              <ClipboardCheck size={16} /> Herramientas de Evaluación
            </button>
            <button
              className={`workspace-tab ${activeViewTab === 'multimodal' ? 'active' : ''}`}
              onClick={() => handleTabSelect('multimodal')}
            >
              <Video size={16} /> Recursos Multimodales
            </button>
            <button
              className={`workspace-tab ${activeViewTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabSelect('history')}
            >
              <History size={16} /> Historial
            </button>
          </div>

          {/* Tab Content Display */}
          <div className={`workspace-scroll-area ${activeViewTab === 'chat' ? 'chat-mode' : ''}`}>
            {activeViewTab === 'chat' && (
              <div className="chat-view-wrapper">
                {messages.length === 0 ? (
                  /* Centered hero state before first message is sent */
                  <div className="centered-hero-state">
                    <div className="hero-logo-box">
                      <BookOpen size={44} color="#ffffff" />
                    </div>
                    <h1 className="hero-title">Planifica</h1>
                    <p className="hero-subtitle">Plataforma Educativa Inteligente</p>
                  </div>
                ) : (
                  /* Messages timeline */
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

                {/* Multiline auto-expanding textarea input form */}
                <form className="chat-input-form" onSubmit={handleSend}>
                  {/* File Attachment Chip */}
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

            {activeViewTab === 'plan' && (
              <LessonPlanView
                data={currentPlanData}
                rubricData={currentRubricData}
                multimodalData={currentMultimodalData}
              />
            )}
            {activeViewTab === 'rubric' && <RubricView data={currentRubricData} />}
            {activeViewTab === 'multimodal' && <MultimodalView data={currentMultimodalData} />}
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

        .workspace-tab-bar {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .workspace-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .workspace-tab:hover {
          background: #f8fafc;
          color: #1d4ed8;
        }

        .workspace-tab.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
          font-weight: 600;
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

        .full-loader {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #1d4ed8;
          font-weight: 600;
          font-size: 1rem;
        }

        .loader-spinner {
          width: 42px;
          height: 42px;
          border: 4px solid #bfdbfe;
          border-top-color: #1d4ed8;
          border-radius: 50%;
        }

        /* Responsive Mobile & Tablet Rules */
        @media (max-width: 900px) {
          .agent-sidebar {
            display: none !important;
          }

          .app-main-layout {
            height: calc(100vh - 60px);
          }

          .workspace-tab-bar {
            padding: 0.5rem 0.75rem;
            gap: 0.35rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .workspace-tab-bar::-webkit-scrollbar {
            display: none;
          }

          .workspace-tab {
            padding: 0.45rem 0.75rem;
            font-size: 0.8rem;
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
