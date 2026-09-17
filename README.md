# 🎓 Planifica - Plataforma Educativa

**Planifica** es una plataforma web moderna para docentes diseñada para automatizar la generación de secuencias didácticas, instrumentos de evaluación (rúbricas y listas de cotejo) y la integración de recursos multimodales alineados a la malla curricular del **Currículum Nacional Base (CNB) de Guatemala**.

---

## 🛠️ Variables de Entorno Requeridas (`.env`)

Crea o edita el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base del servidor LangGraph
VITE_LANGGRAPH_API_URL=http://localhost:8000

# Client ID de Google OAuth 2.0 para inicio de sesión
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

---

## 📁 Estructura del Proyecto

```text
web-planifica/
├── public/
│   ├── Logotipo.svg          # Logotipo vectorial oficial y Favicon de la plataforma
│   └── icons.svg             # Colección de iconos vectoriales adicionales
├── src/
│   ├── assets/               # Recursos estáticos
│   ├── components/           # Componentes principales de la interfaz
│   │   ├── Navbar.tsx             # Barra de navegación superior (selector de hilos y perfil docente)
│   │   ├── LoginModal.tsx         # Pantalla de inicio de sesión responsive con Google OAuth
│   │   ├── ChatMessage.tsx        # Burbujas de mensajes del chat con animaciones de streaming y formato Markdown
│   │   ├── AgentStatusPanel.tsx   # Panel lateral de navegación e indicadores del workspace
│   │   └── Visualizers/           # Vistas especializadas e interactivas
│   │       ├── LessonPlanView.tsx     # Visualizador de secuencias didácticas y botón de Exportación a Word
│   │       ├── RubricView.tsx         # Visualizador de rúbricas analíticas y listas de cotejo
│   │       ├── MultimodalView.tsx     # Galería interactiva de recursos multimodales (video, audio, etc.)
│   │       └── ThreadHistoryView.tsx  # Historial estructurado y gestión de conversaciones
│   ├── context/              # Proveedores de estado global (React Context)
│   │   ├── AuthContext.tsx        # Gestión de sesión mediante HttpOnly Cookies del servidor y Google OAuth 2.0
│   │   └── LangGraphContext.tsx   # Estado del chat, transmisión SSE de LangGraph y datos estructurados
│   ├── services/             # Servicios de integración
│   │   └── api.ts                 # Cliente HTTP y transmisión SSE (/threads, /runs/stream, payloads JSON Base64)
│   ├── types/                # Definición de tipos e interfaces de TypeScript
│   │   └── index.ts               # Modelos para Planes, Rúbricas, Recursos, Hilos y Usuarios
│   ├── utils/                # Funciones utilitarias
│   │   ├── dateFormatter.ts       # Formateador de fechas y horas en zona horaria GMT-6
│   │   └── wordExporter.ts        # Módulo de exportación formal a Microsoft Word (.docx)
│   ├── App.tsx               # Contenedor principal del Workspace y adjunción directa de archivos en el chat
│   └── main.tsx              # Punto de entrada de la aplicación React
├── index.html                # Plantilla HTML principal con carga de tipografías (Outfit & Inter) y favicon
├── package.json              # Dependencias (docx, lucide-react, react-markdown, etc.)
├── tsconfig.json             # Configuración del compilador TypeScript
└── vite.config.ts            # Configuración del empaquetador Vite
```

---

## 🚀 Instalación y Ejecución

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Modo Desarrollo

```bash
npm run dev
```

### 3. Compilación para Producción

```bash
npm run build
```

