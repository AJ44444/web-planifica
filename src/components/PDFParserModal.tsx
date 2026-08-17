import React, { useState } from 'react';
import { useLangGraph } from '../context/LangGraphContext';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface PDFParserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFParserModal: React.FC<PDFParserModalProps> = ({ isOpen, onClose }) => {
  const { uploadCNBPDF, pdfProgress } = useLangGraph();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      } else {
        alert('Por favor selecciona un archivo en formato PDF.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (selectedFile) {
      await uploadCNBPDF(selectedFile);
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
      }, 1200);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="header-title-box">
            <div className="modal-icon-badge">
              <FileText size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-title">Carga de Documentos Curriculares (CNB)</h3>
              <p className="modal-subtitle">Procesamiento automático de documentos curriculares</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!pdfProgress.isUploading && pdfProgress.progress === 0 ? (
            <>
              <div
                className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
              >
                <UploadCloud size={48} color="#2563eb" />
                <p className="dropzone-text">
                  Arrastra y suelta aquí el archivo
                </p>
                <span className="dropzone-subtext">Soporta un currículum con formato del CNB</span>

                <label className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Examinar Archivo PDF
                  <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              {selectedFile && (
                <div className="selected-file-card">
                  <FileText size={24} color="#1d4ed8" />
                  <div className="file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleStartUpload}>
                    Procesar CNB
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="upload-progress-container">
              <div className="progress-status-header">
                <Loader2 size={24} className="animate-spin" color="#1d4ed8" />
                <div className="status-text-group">
                  <span className="status-title">{pdfProgress.filename}</span>
                  <span className="status-desc">{pdfProgress.statusText}</span>
                </div>
                <span className="progress-percent">{pdfProgress.progress}%</span>
              </div>

              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pdfProgress.progress}%` }}
                />
              </div>

              {pdfProgress.progress === 100 && (
                <div className="success-banner">
                  <CheckCircle2 size={20} color="#059669" />
                  <span>
                    ¡Indexación exitosa! Se extrajeron <strong>{pdfProgress.extractedNodes} nodos curriculares</strong> (áreas, subáreas y competencias).
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="modal-info-box">
            <Sparkles size={16} color="#1d4ed8" />
            <p>
              Analiza en tiempo real la estructura del documento y habilita la búsqueda contextual.
            </p>
          </div>
        </div>

        <style>{`
          .modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 1rem;
          }

          .modal-card {
            background: #ffffff;
            border-radius: 0.85rem;
            border: 1px solid #e2e8f0;
            width: 100%;
            max-width: 540px;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            padding: 1.15rem 1.25rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
          }

          .header-title-box {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .modal-icon-badge {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-title {
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          .modal-subtitle {
            font-size: 0.75rem;
            color: #64748b;
            margin: 0;
          }

          .btn-close {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0.35rem;
            border-radius: 0.375rem;
          }
          .btn-close:hover { background: #e2e8f0; color: #0f172a; }

          .modal-body {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .dropzone {
            border: 2px dashed #cbd5e1;
            border-radius: 0.75rem;
            padding: 2rem 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: #f8fafc;
            transition: all 0.2s ease;
          }

          .dropzone.dragover {
            border-color: #2563eb;
            background: #eff6ff;
          }

          .dropzone-text {
            font-weight: 600;
            font-size: 0.9rem;
            color: #0f172a;
            margin-top: 0.75rem;
          }

          .dropzone-subtext {
            font-size: 0.75rem;
            color: #64748b;
            margin-top: 0.25rem;
          }

          .selected-file-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 0.5rem;
          }

          .file-info {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .file-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: #1e40af;
          }

          .file-size {
            font-size: 0.725rem;
            color: #3b82f6;
          }

          .upload-progress-container {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            background: #f8fafc;
            padding: 1rem;
            border-radius: 0.65rem;
            border: 1px solid #e2e8f0;
          }

          .progress-status-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .status-text-group {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .status-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #0f172a;
          }

          .status-desc {
            font-size: 0.75rem;
            color: #64748b;
          }

          .progress-percent {
            font-size: 0.9rem;
            font-weight: 700;
            color: #1d4ed8;
          }

          .progress-bar-track {
            height: 8px;
            background: #e2e8f0;
            border-radius: 9999px;
            overflow: hidden;
          }

          .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
            transition: width 0.3s ease;
          }

          .success-banner {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 0.85rem;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            color: #065f46;
          }

          .modal-info-box {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            background: #f1f5f9;
            padding: 0.65rem 0.85rem;
            border-radius: 0.5rem;
            font-size: 0.775rem;
            color: #475569;
          }
        `}</style>
      </div>
    </div>
  );
};
