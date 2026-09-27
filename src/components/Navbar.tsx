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

      <style>{`
        .navbar {
          height: 68px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          box-shadow: 0 2px 10px rgba(29, 78, 216, 0.04);
          position: relative;
          z-index: 40;
        }

        .navbar-left, .navbar-center, .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-upload-cnb {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.45rem 0.85rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-upload-cnb:hover {
          background: #dbeafe;
          border-color: #2563eb;
          transform: translateY(-1px);
        }

        .btn-hamburger-menu {
          display: none;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          border-radius: 0.5rem;
          padding: 0.4rem;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-hamburger-menu:hover {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .mobile-menu-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border-bottom: 1px solid #cbd5e1;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
          z-index: 99;
          padding: 0.75rem 1rem;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .mobile-nav-item:hover {
          background: #f8fafc;
          color: #1d4ed8;
        }

        .mobile-nav-item.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
          font-weight: 600;
        }

        .mobile-cnb-btn {
          color: #1d4ed8;
          font-weight: 600;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        /* Modal Styles */
        .cnb-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
          animation: fadeInModal 0.2s ease-out;
        }

        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cnb-modal-card {
          background: #ffffff;
          border-radius: 0.85rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.25);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          animation: scaleUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUpModal {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .cnb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .cnb-modal-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cnb-modal-icon {
          color: #1d4ed8;
        }

        .cnb-modal-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .cnb-modal-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }

        .cnb-modal-close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.35rem;
          border-radius: 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .cnb-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .cnb-modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cnb-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cnb-form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .required-star {
          color: #dc2626;
        }

        .cnb-form-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cnb-form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .cnb-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 0.65rem;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .cnb-dropzone:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .cnb-dropzone.has-file {
          border-style: solid;
          border-color: #bfdbfe;
          background: #eff6ff;
          padding: 1rem;
        }

        .dropzone-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .upload-icon {
          color: #1d4ed8;
        }

        .upload-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e40af;
        }

        .upload-hint {
          font-size: 0.75rem;
          color: #64748b;
        }

        .selected-file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .file-icon {
          color: #1d4ed8;
          flex-shrink: 0;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          text-align: left;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: #64748b;
        }

        .change-file-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: 0.35rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .change-file-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .cnb-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-process-cnb {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .spin-loader {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .btn-hamburger-menu {
            display: flex;
          }
          .navbar-center {
            display: none;
          }
          .cnb-btn-text {
            display: none;
          }
          .btn-upload-cnb {
            padding: 0.45rem;
          }
        }
      `}</style>
    </header>
  );
};
