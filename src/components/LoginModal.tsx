import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ShieldCheck, Cpu, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginWithToken } = useAuth();

  const handleGoogleSuccess = React.useCallback(async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await loginWithToken(credentialResponse.credential);
      } catch {
        window.alert('Falló la conexión con el servidor. No fue posible completar la autenticación.');
      }
    }
  }, [loginWithToken]);

  const handleGoogleError = React.useCallback(() => {
    window.alert('Ocurrió un inconveniente al conectar con el servicio de autenticación de Google.');
  }, []);

  return (
    <div className="login-backdrop">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="login-container">
        <div className="login-hero-col">
          <div className="hero-main-content">
            <h1 className="hero-headline">
              La plataforma para la <span className="gradient-text">planificación docente</span> inteligente
            </h1>
            <p className="hero-description">
              Diseña secuencias didácticas por fases, genera rúbricas analíticas e integra recursos multimodales alineados al CNB de Guatemala.
            </p>
          </div>

          <div className="agent-graph-graphic">
            <div className="graph-svg-container">
              <svg className="graph-lines" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="graph-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                  </linearGradient>

                  <filter id="orb-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  id="graph-sine-path"
                  d="M 100 60 C 150 25, 200 95, 250 60 C 300 25, 350 95, 400 60"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <use href="#graph-sine-path" stroke="url(#graph-grad-1)" strokeWidth="2.5" strokeDasharray="none" />

                <g>
                  <circle r="7" fill="#2563eb" filter="url(#orb-glow)" opacity="0.85">
                    <animateMotion dur="3.2s" repeatCount="indefinite">
                      <mpath href="#graph-sine-path" />
                    </animateMotion>
                  </circle>
                  <circle r="3.5" fill="#ffffff">
                    <animateMotion dur="3.2s" repeatCount="indefinite">
                      <mpath href="#graph-sine-path" />
                    </animateMotion>
                  </circle>
                </g>
              </svg>

              <div className="graph-node node-1" title="Procesador CNB">
                <div className="node-ping" />
                <BookOpen size={14} color="#ffffff" />
                <span className="node-tooltip">Procesador CNB</span>
              </div>
              <div className="graph-node node-2" title="Supervisor LangGraph">
                <div className="node-ping" />
                <Cpu size={16} color="#ffffff" />
                <span className="node-tooltip">Supervisor</span>
              </div>
              <div className="graph-node node-3" title="Planificador de Clases">
                <div className="node-ping" />
                <Layers size={14} color="#ffffff" />
                <span className="node-tooltip">Planificador</span>
              </div>
            </div>
          </div>

          <div className="hero-trust-footer">
            <span className="trust-label">Impulsado por</span>
            <div className="trust-badges-grid">
              <div className="trust-chip">
                <Cpu size={14} color="#60a5fa" />
                <span>LangGraph</span>
              </div>
              <div className="trust-chip">
                <BookOpen size={14} color="#60a5fa" />
                <span>Malla Curricular</span>
              </div>
              <div className="trust-chip">
                <ShieldCheck size={14} color="#60a5fa" />
                <span>Google OAuth 2.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-card-col">
          <div className="auth-card">
            <div className="card-header">
              <h2 className="auth-title">Iniciar Sesión</h2>
              <p className="auth-subtitle">
                Ingresa con tu cuenta institucional o personal de Google para acceder al espacio de trabajo.
              </p>
            </div>

            <div className="auth-body">
              <div className="google-auth-box">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  ux_mode="popup"
                  shape="pill"
                  theme="outline"
                  text="continue_with"
                />
              </div>

              <div className="features-checklist">
                <div className="check-item">
                  <CheckCircle2 size={16} className="check-icon" />
                  <span>Secuencias didácticas estructuradas por fases</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={16} className="check-icon" />
                  <span>Rúbricas analíticas y listas de cotejo automáticas</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={16} className="check-icon" />
                  <span>Galería interactiva de recursos multimodales</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <ShieldCheck size={14} color="#64748b" />
              <span>Conexión cifrada y almacenamiento seguro </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
