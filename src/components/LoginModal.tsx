import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ShieldCheck, Cpu, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginWithToken } = useAuth();

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      loginWithToken(credentialResponse.credential);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth Authentication failed');
  };

  return (
    <div className="login-backdrop">
      {/* Background ambient lighting effects */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="login-container">
        {/* Left Column: Visual Brand Hero & Agent Network Narrative (LangSmith style) */}
        <div className="login-hero-col">
          <div className="hero-main-content">
            <h1 className="hero-headline">
              La plataforma para la <span className="gradient-text">planificación docente</span> inteligente
            </h1>
            <p className="hero-description">
              Diseña secuencias didácticas por fases, genera rúbricas analíticas e integra recursos multimodales alineados al CNB de Guatemala.
            </p>
          </div>

          {/* Interactive Agent Node Network Graphic with Traveling Pulse Animation */}
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

                {/* Base guide connecting path */}
                <path
                  d="M 100 60 C 150 25, 200 95, 250 60 C 300 25, 350 95, 400 60"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Main animated flow line */}
                <path
                  d="M 100 60 C 150 25, 200 95, 250 60 C 300 25, 350 95, 400 60"
                  stroke="url(#graph-grad-1)"
                  strokeWidth="2.5"
                />

                {/* Traveling Energy Orb (Procesador CNB => Supervisor => Planificador) */}
                <g>
                  {/* Outer glowing aura */}
                  <circle r="7" fill="#2563eb" filter="url(#orb-glow)" opacity="0.85">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path="M 100 60 C 150 25, 200 95, 250 60 C 300 25, 350 95, 400 60"
                    />
                  </circle>
                  {/* Inner bright core */}
                  <circle r="3.5" fill="#ffffff">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path="M 100 60 C 150 25, 200 95, 250 60 C 300 25, 350 95, 400 60"
                    />
                  </circle>
                </g>
              </svg>

              {/* Luminous Agent Nodes */}
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

          {/* Trust Badges */}
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

        {/* Right Column: Dark Glassmorphic Login Card */}
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

      <style>{`
        .login-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          overflow-y: auto;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.6;
        }

        .bg-glow-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(255, 255, 255, 0) 70%);
          top: -150px;
          left: -100px;
        }

        .bg-glow-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(29, 78, 216, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: -100px;
          right: -50px;
        }

        .login-container {
          position: relative;
          width: 100%;
          max-width: 1100px;
          min-height: 580px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
          z-index: 1;
        }

        /* Left Hero Column */
        .login-hero-col {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
          color: #0f172a;
        }

        .hero-brand-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-logo-badge {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .brand-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(29, 78, 216, 0.2));
        }

        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
        }

        .hero-version-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 0.725rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .hero-main-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hero-headline {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin: 0;
        }

        .gradient-text {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
          max-width: 520px;
        }

        /* Agent Graph Graphic */
        .agent-graph-graphic {
          position: relative;
          width: 100%;
          height: 110px;
          background: #f8fafc;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .graph-svg-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .graph-lines {
          width: 100%;
          height: 100%;
        }

        .graph-node {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(29, 78, 216, 0.35);
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .graph-node:hover {
          transform: translate(-50%, -50%) scale(1.15);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.5);
        }

        .node-ping {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #2563eb;
          animation: nodePingAnim 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        }

        .node-1 .node-ping { animation-delay: 0s; }
        .node-2 .node-ping { animation-delay: 1s; }
        .node-3 .node-ping { animation-delay: 2s; }

        @keyframes nodePingAnim {
          0% { transform: scale(1); opacity: 0.8; }
          70%, 100% { transform: scale(1.7); opacity: 0; }
        }

        .node-1 { top: 50%; left: 20%; }
        .node-2 { top: 50%; left: 50%; width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .node-3 { top: 50%; left: 80%; }

        .node-tooltip {
          position: absolute;
          bottom: -22px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        /* Trust Footer */
        .hero-trust-footer {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .trust-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .trust-badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.85rem;
          border-radius: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Right Column: Light Elevated Card */
        .login-card-col {
          display: flex;
          justify-content: center;
        }

        .auth-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 1.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px -10px rgba(29, 78, 216, 0.09), 0 1px 3px rgba(15, 23, 42, 0.04);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .auth-badge {
          display: inline-block;
          align-self: flex-start;
          padding: 0.25rem 0.65rem;
          border-radius: 0.35rem;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          border: 1px solid #bfdbfe;
        }

        .auth-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .auth-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .auth-body {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .google-auth-box {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .features-checklist {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 0.85rem;
          border: 1px solid #e2e8f0;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.825rem;
          color: #334155;
        }

        .check-icon {
          color: #1d4ed8;
          flex-shrink: 0;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.725rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 1.25rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            max-width: 480px;
          }

          .hero-headline {
            font-size: 1.95rem;
          }

          .agent-graph-graphic {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

