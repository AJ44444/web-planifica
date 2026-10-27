import React, { useState, useEffect, useRef } from 'react';
import { Edit3, HelpCircle, X } from 'lucide-react';

export interface SelectedElementInfo {
  id?: string;
  label: string;
  selector?: string;
  previewText?: string;
  selectedText?: string;
  rect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
}

interface ElementEditorPopoverProps {
  selected: SelectedElementInfo | null;
  onClose: () => void;
  onSubmit: (instruction: string, intent: 'change' | 'question') => void;
  isSubmitting?: boolean;
}

export const ElementEditorPopover: React.FC<ElementEditorPopoverProps> = ({
  selected,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [instruction, setInstruction] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      setInstruction('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [selected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selected) return null;

  const PADDING = 12;
  const POPOVER_WIDTH = 340;
  const POPOVER_HEIGHT = 220;

  let left = selected.rect.left;
  if (left + POPOVER_WIDTH > window.innerWidth - PADDING) {
    left = window.innerWidth - POPOVER_WIDTH - PADDING;
  }
  if (left < PADDING) {
    left = PADDING;
  }

  let top = selected.rect.bottom + 8;
  if (top + POPOVER_HEIGHT > window.innerHeight - PADDING) {
    if (selected.rect.top - POPOVER_HEIGHT - 8 > PADDING) {
      top = selected.rect.top - POPOVER_HEIGHT - 8;
    } else {
      top = window.innerHeight - POPOVER_HEIGHT - PADDING;
    }
  }

  const handleAction = (intent: 'change' | 'question') => {
    if (!instruction.trim() || isSubmitting) return;
    onSubmit(instruction.trim(), intent);
  };

  const displayText = selected.selectedText 
    ? `"${selected.selectedText.slice(0, 32)}${selected.selectedText.length > 32 ? '...' : ''}"`
    : selected.previewText 
      ? `"${selected.previewText.slice(0, 32)}${selected.previewText.length > 32 ? '...' : ''}"`
      : '';

  return (
    <div
      ref={popoverRef}
      className="element-editor-popover"
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${POPOVER_WIDTH}px`,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="popover-header">
        <div className="header-info">
          <div className="header-title-row">
            <span className="element-kind-title">
              {selected.label} {displayText ? displayText : ''}
            </span>
          </div>
          {selected.id && (
            <div className="element-selector-tag">
              id: {selected.id}
            </div>
          )}
        </div>
        <button
          type="button"
          className="popover-close-btn"
          onClick={onClose}
          title="Cerrar editor"
        >
          <X size={15} />
        </button>
      </div>

      <div className="popover-body">
        <textarea
          ref={textareaRef}
          className="popover-textarea"
          placeholder="Escribe los cambios o instrucciones para este elemento..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAction('change');
            }
          }}
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="popover-footer">
        <span className="intent-label">Intención</span>
        <div className="intent-buttons-row">
          <button
            type="button"
            className="btn-intent btn-change"
            onClick={() => handleAction('change')}
            disabled={!instruction.trim() || isSubmitting}
            title="Enviar cambios al chat asociando el ID del elemento"
          >
            <Edit3 size={13} />
            <span>Cambiar</span>
          </button>
          <button
            type="button"
            className="btn-intent btn-question"
            onClick={() => handleAction('question')}
            disabled={!instruction.trim() || isSubmitting}
            title="Hacer una consulta sobre este elemento"
          >
            <HelpCircle size={13} />
            <span>Preguntar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
