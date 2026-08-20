# 🎓 Planifica - Plataforma Educativa Inteligente

**Planifica** es una plataforma web moderna para docentes diseñada para automatizar la generación de secuencias didácticas, instrumentos de evaluación (rúbricas y listas de cotejo) y la integración de recursos multimodales alineados a la malla curricular del **Currículum Nacional Base (CNB) de Guatemala**.

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
│   │   ├── AuthContext.tsx        # Gestión de sesión con cookies (persistencia de 1 día) y Google OAuth 2.0
│   │   └── LangGraphContext.tsx   # Estado del chat, transmisión SSE de LangGraph y datos estructurados
│   ├── services/             # Servicios de integración
│   │   └── api.ts                 # Cliente HTTP y transmisión SSE (/threads, /runs/stream, multipart binary streams)
│   ├── types/                # Definición de tipos e interfaces de TypeScript
│   │   └── index.ts               # Modelos para Planes, Rúbricas, Recursos, Hilos y Usuarios
│   ├── utils/                # Funciones utilitarias
│   │   ├── parser.ts              # Validador y parser JSON de respuestas estructuradas
│   │   └── wordExporter.ts        # Módulo de exportación formal a Microsoft Word (.docx)
│   ├── App.tsx               # Contenedor principal del Workspace y adjunción directa de archivos en el chat
│   └── main.tsx              # Punto de entrada de la aplicación React
├── index.html                # Plantilla HTML principal con carga de tipografías (Outfit & Inter) y favicon
├── package.json              # Dependencias (docx, lucide-react, react-markdown, js-cookie, etc.)
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

- **Exportación Formal a Microsoft Word (`.docx`)**:
  - Exportación directa desde el visualizador de plan con el botón **`Exportar`**.
  - Generación de documento horizontal (Landscape) en tamaño Carta con matriz curricular de 4 columnas, encabezados oficiales, tablas de evaluación y tabla de recursos con anchos equilibrados y salto de línea automático en URLs.
  - Nombre dinámico del archivo descargado: `planificacion_[nombre_del_curso].docx`.

- **Carga Directa de Documentos CNB (Stream de Bytes Binarios)**:
  - Adjunción de archivos PDF del CNB directamente en la caja de texto del chat mediante el botón de clip 📎.
  - Validación de formato exclusivo **PDF** y tamaño máximo permitidos de **10 MB**.
  - Transmisión en memoria mediante stream binario de bytes (`multipart/form-data`).

- **Autenticación Segura y Persistencia**:
  - Integración con Google OAuth 2.0 y gestión de sesión almacenada en cookies con caducidad de 1 día y limpieza en cierre de sesión.

- **Grafo Multiagente Transmisión SSE**:
  - Conexión en tiempo real mediante Server-Sent Events con el Grafo Supervisor de LangGraph y parseo dinámico de datos estructurados.

- **Estandarización Tipográfica y Diseño Responsive**:
  - Tipografía unificada (`Outfit` para encabezados e `Inter` para texto general).
  - Adaptación responsive completa en login, barra superior y visualizadores para escritorio, tabletas y teléfonos móviles.
