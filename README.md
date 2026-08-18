# 🎓 Planifica - Plataforma Educativa Inteligente Multiagente

**Planifica** es una plataforma web moderna para docentes diseñada para automatizar la generación de secuencias didácticas, instrumentos de evaluación (rúbricas y listas de cotejo) y la integración de recursos multimodales alineados a la malla curricular del **Currículum Nacional Base (CNB) de Guatemala**, utilizando una arquitectura basada en **Grafos Multiagente (LangGraph)** y **Google Gemini**.

---

## 🛠️ Variables de Entorno Requeridas (`.env`)

Crea o edita el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base del servidor LangGraph Supervisor API
VITE_LANGGRAPH_API_URL=http://localhost:8000

# Client ID de Google OAuth 2.0 para inicio de sesión de docentes
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
│   │   ├── Navbar.tsx             # Barra de navegación superior (selector de hilos, carga CNB, perfil)
│   │   ├── LoginModal.tsx         # Pantalla de inicio de sesión split-screen con Google OAuth
│   │   ├── ChatMessage.tsx        # Burbujas de mensajes del chat con animaciones y formato Markdown
│   │   ├── AgentStatusPanel.tsx   # Panel lateral de monitoreo de subagentes y workspace
│   │   ├── PDFParserModal.tsx     # Modal interactivo para la carga e indexación de archivos CNB PDF
│   │   └── Visualizers/           # Vistas especializadas e interactivas
│   │       ├── LessonPlanView.tsx     # Visualizador de secuencias didácticas por fases
│   │       ├── RubricView.tsx         # Visualizador de rúbricas analíticas y listas de cotejo
│   │       ├── MultimodalView.tsx     # Galería interactiva de recursos multimodales (video, audio, etc.)
│   │       └── ThreadHistoryView.tsx  # Historial estructurado y gestión de conversaciones
│   ├── context/              # Proveedores de estado global (React Context)
│   │   ├── AuthContext.tsx        # Gestión de sesión con cookies e inicio con Google OAuth 2.0
│   │   └── LangGraphContext.tsx   # Estado del chat, streaming SSE de LangGraph y visualizadores
│   ├── services/             # Servicios de integración
│   │   └── api.ts                 # Cliente HTTP y transmisión SSE (/threads, /runs/stream, /history)
│   ├── types/                # Definición de tipos e interfaces de TypeScript
│   │   └── index.ts               # Modelos para Planes, Rúbricas, Recursos, Hilos y Usuarios
│   ├── utils/                # Funciones utilitarias
│   │   └── parser.ts              # Validador y parser JSON nativo de respuestas estructuradas
│   ├── App.tsx               # Contenedor principal del Workspace y barra de navegación superior
│   └── main.tsx              # Punto de entrada de la aplicación React
├── index.html                # Plantilla HTML principal con carga del favicon Logotipo.svg
├── package.json              # Dependencias y scripts del proyecto
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

---

## ⚡ Características Destacadas

- **Autenticación Segura**: Integración con Google OAuth 2.0 y persistencia estricta en cookies HTTP.
- **Grafo Multiagente Transmisión SSE**: Conexión directa en tiempo real con el Grafo Supervisor de LangGraph.
- **Indexación del CNB**: Subida y lectura estructurada de documentos PDF curriculares.
- **Visualización Limpia**: Sincronización automática de visualizadores de planes, rúbricas y recursos.
- **Diseño Adaptable (Responsive)**: Interfaz fluida optimizada para computadoras, tabletas y teléfonos móviles.
