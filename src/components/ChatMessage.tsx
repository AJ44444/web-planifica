import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessageProps } from '../types';
import { Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ponytail: Memoize ChatMessage to prevent non-streaming messages from re-parsing markdown on every token
export const ChatMessage = React.memo<ChatMessageProps>(({ message, isStreaming }) => {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const displayContent = message.content;

  const showLoadingDots = !isUser && isStreaming && !message.content;
  const showFooterDots = !isUser && isStreaming && !!message.content;

  if (!isUser && !displayContent && !showLoadingDots && !showFooterDots) {
    return null;
  }

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="avatar-cell">
        {isUser ? (
          <div className="user-chat-avatar">
            {user?.nombres ? user.nombres.slice(0, 2).toUpperCase() : 'US'}
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
    </div>
  );
}, (prev, next) => (
  prev.isStreaming === next.isStreaming &&
  prev.message.id === next.message.id &&
  prev.message.content === next.message.content
));