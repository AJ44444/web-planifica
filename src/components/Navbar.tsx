import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLangGraph } from '../context/LangGraphContext';
import { 
  generateUploadUrl, 
  uploadFileToPresignedUrl, 
  processPdf 
} from '../services/api';
import { 
  BookOpen, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Menu, 
  X,
  MessageSquare,
  Layers,
  ClipboardCheck,
  Video,
  History,
  FileText,
  Upload,
  Loader2
} from 'lucide-react';
import type { ViewTabType } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    isServerOnline, 
    threads, 
    currentThreadId, 
    selectThread, 
    createNewThread,
    activeViewTab,
    setActiveViewTab
  } = useLangGraph();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [nombreCarrera, setNombreCarrera] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectTab = (tab: ViewTabType) => {
    setActiveViewTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const MAX_SIZE_BYTES = 10 * 1024 * 1024;

      if (!isPdf) {
        window.alert('Solo se admiten archivos en formato PDF.');
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        window.alert('El archivo supera el tamaño máximo permitido de 10 MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadAndProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !nombreCarrera.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const presignedData = await generateUploadUrl();

      await uploadFileToPresignedUrl(presignedData, selectedFile);

      const res = await processPdf(presignedData.file_key, nombreCarrera.trim());

      window.alert(res.message || 'Documento PDF procesado correctamente.');

      setIsModalOpen(false);
      setSelectedFile(null);
      setNombreCarrera('');
    } catch (err: any) {
      window.alert(err?.message || 'No fue posible procesar el archivo PDF. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="btn-hamburger-menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          title={isMobileMenuOpen ? 'Cerrar menú' : 'Desplegar menú'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="brand-logo">
          <div className="logo-icon">
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div className="logo-text">
            <span className="brand-title">Planifica</span>
          </div>
        </div>

        <div className={`server-status ${isServerOnline ? 'online' : 'offline'}`}>
          {isServerOnline ? (
            <>
              <CheckCircle2 size={14} />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Desconectado</span>
            </>
          )}
        </div>
      </div>

      <div className="navbar-center">
        <div className="thread-selector-container">
          <select
            className="thread-select"
            value={currentThreadId || ''}
            onChange={(e) => selectThread(e.target.value)}
          >
            {threads.slice(0, 10).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={createNewThread} title="Nueva Conversación">
            <Plus size={16} />
            <span>Nueva</span>
          </button>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="btn-upload-cnb"
          onClick={() => setIsModalOpen(true)}
          title="Cargar documento CNB (PDF)"
        >
          <FileText size={16} />
          <span className="cnb-btn-text">Cargar CNB</span>
        </button>

        {user && (
          <div className="user-profile-chip">
            <div className="user-avatar-fallback">
              {(user.nombres).slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.nombres}</span>
            </div>
            <button className="btn-icon-logout" onClick={logout} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <nav className="mobile-nav-list">
            <button
              className={`mobile-nav-item ${activeViewTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleSelectTab('chat')}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'planifications' ? 'active' : ''}`}
              onClick={() => handleSelectTab('planifications')}
            >
              <Layers size={18} />
              <span>Planificaciones</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'plan' ? 'active' : ''}`}
              onClick={() => handleSelectTab('plan')}
            >
              <BookOpen size={18} />
              <span>Planificación</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'rubric' ? 'active' : ''}`}
              onClick={() => handleSelectTab('rubric')}
            >
              <ClipboardCheck size={18} />
              <span>Herramientas de Evaluación</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'multimodal' ? 'active' : ''}`}
              onClick={() => handleSelectTab('multimodal')}
            >
              <Video size={18} />
              <span>Recursos Multimodales</span>
            </button>
            <button
              className={`mobile-nav-item ${activeViewTab === 'history' ? 'active' : ''}`}
              onClick={() => handleSelectTab('history')}
            >
              <History size={18} />
              <span>Historial</span>
            </button>

            <button
              className="mobile-nav-item mobile-cnb-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsModalOpen(true);
              }}
            >
              <FileText size={18} />
              <span>Cargar Documento CNB</span>
            </button>
          </nav>
        </div>
      )}

      {isModalOpen && (
        <div className="cnb-modal-overlay" onClick={() => !isProcessing && setIsModalOpen(false)}>
          <div className="cnb-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cnb-modal-header">
              <div className="cnb-modal-title-row">
                <FileText size={20} className="cnb-modal-icon" />
                <div>
                  <h3 className="cnb-modal-title">Cargar Documento CNB</h3>
                  <p className="cnb-modal-subtitle">Procesar currículum nacional base en formato PDF</p>
                </div>
              </div>
              <button
                type="button"
                className="cnb-modal-close-btn"
                onClick={() => !isProcessing && setIsModalOpen(false)}
                disabled={isProcessing}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadAndProcess} className="cnb-modal-form">
              <div className="cnb-form-group">
                <label className="cnb-form-label">
                  Nombre de la Carrera <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="cnb-form-input"
                  placeholder="Ej: Bachillerato en Ciencias y Letras"
                  value={nombreCarrera}
                  onChange={(e) => setNombreCarrera(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="cnb-form-group">
                <label className="cnb-form-label">
                  Documento PDF <span className="required-star">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  className={`cnb-dropzone ${selectedFile ? 'has-file' : ''}`}
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="selected-file-info">
                      <FileText size={26} className="file-icon" />
                      <div className="file-details">
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        className="change-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        disabled={isProcessing}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <Upload size={26} className="upload-icon" />
                      <span className="upload-text">Haz clic aquí para seleccionar el archivo PDF</span>
                      <span className="upload-hint">Formato admitido: .PDF (máx. 10 MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="cnb-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-process-cnb"
                  disabled={!selectedFile || !nombreCarrera.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-loader" />
                      <span>Procesando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Procesar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
