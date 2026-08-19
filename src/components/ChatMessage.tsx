import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types';
import { Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { isFullPlanResponse } from '../utils/parser';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

const PREDETERMINED_PLAN_NOTIFICATION = `¡Excelente! La planificación didáctica completa ha sido generada y renderizada con éxito.

Sus elementos ya se encuentran disponibles para su consulta en los visualizadores del espacio de trabajo:

- 📖 **Visualizador de Plan**: Encabezado administrativo, competencias, indicadores de logro, contenidos y secuencia didáctica por fases (*Inicio, Desarrollo y Cierre*).
- 📋 **Rúbricas & Cotejo**: Rúbrica analítica y lista de cotejo para evaluar las actividades.
- 🎬 **Recursos Multimodales**: Galería interactiva con videos, imágenes, audios y documentos sugeridos.`;

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);

  const isUser = message.role === 'user';
  const userPhoto = user?.picture;
  const showFullPlanMessage = !isUser && (message.isFullPlanResponse || isFullPlanResponse(message.content));
  const displayContent = showFullPlanMessage ? PREDETERMINED_PLAN_NOTIFICATION : message.content;

  // Render floating dots ONLY while actively streaming
  const showLoadingDots = !isUser && isStreaming && !message.content;
  const showFooterDots = !isUser && isStreaming && !!message.content;

  // Do not render empty assistant message rows if not streaming and no content
  if (!isUser && !displayContent && !showLoadingDots && !showFooterDots) {
    return null;
  }

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="avatar-cell">
        {isUser ? (
          <div className="user-chat-avatar">
            {userPhoto && !imgError ? (
              <img
                src={userPhoto}
                alt={user?.name || "Usuario"}
                className="user-avatar-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <User size={18} color="#ffffff" />
            )}
          </div>
        ) : (
          <div className="assistant-chat-avatar">
            <Bot size={18} color="#ffffff" />
          </div>
        )}
      </div>

      <div className="message-bubble-wrapper">
        {!isUser && (
          <div className="assistant-header-meta">
            <span className="assistant-label">Planifica</span>
            <span className="timestamp">{message.timestamp.slice(11, 16)}</span>
          </div>
        )}

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          {showLoadingDots ? (
            <div className="floating-dots-loader">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          ) : (
            <>
              {displayContent ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayContent}
                  </ReactMarkdown>
                </div>
              ) : null}

              {showFooterDots && (
                <div className="floating-dots-footer">
                  <div className="floating-dots-loader">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .message-row {
          display: flex;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
          width: 100%;
        }

        .user-row {
          flex-direction: row-reverse;
        }

        .avatar-cell {
          flex-shrink: 0;
        }

        .user-chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
          overflow: hidden;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .assistant-chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }

        .message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 90%;
          min-width: 0;
          width: 100%;
        }

        .user-row .message-bubble-wrapper {
          max-width: 75%;
          width: auto;
        }

        .assistant-header-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .assistant-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
        }

        .timestamp {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .message-bubble {
          padding: 0.85rem 1.15rem;
          border-radius: 0.85rem;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          min-width: 0;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .user-bubble {
          background: #1d4ed8;
          color: #ffffff;
          border-top-right-radius: 0.15rem;
        }

        .user-bubble .markdown-body {
          color: #ffffff;
        }

        .user-bubble .markdown-body code {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .assistant-bubble {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 0.15rem;
        }

        .floating-dots-footer {
          margin-top: 0.65rem;
          padding-top: 0.45rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
        }

        .floating-dots-loader {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.5rem;
        }

        .floating-dots-loader .dot {
          width: 8px;
          height: 8px;
          background-color: #2563eb;
          border-radius: 50%;
          animation: floatDot 1.4s infinite ease-in-out both;
        }

        .floating-dots-loader .dot:nth-child(1) { animation-delay: -0.32s; }
        .floating-dots-loader .dot:nth-child(2) { animation-delay: -0.16s; }
        .floating-dots-loader .dot:nth-child(3) { animation-delay: 0s; }

        @keyframes floatDot {
          0%, 80%, 100% {
            transform: scale(0.4);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.1) translateY(-5px);
            opacity: 1;
          }
        }

        .quick-action-toolbar {
          margin-top: 0.85rem;
          padding-top: 0.65rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .quick-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 0.375rem;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quick-view-btn:hover {
          background: #dbeafe;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
