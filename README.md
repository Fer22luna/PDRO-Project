# Portal de Decretos, Resoluciones y Ordenanzas (PDRO)

Sistema web de gestión y publicación de normativas institucionales desarrollado con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características Implementadas

### Portal Público
- ✅ Visualización de normativas publicadas en tabla responsiva
- ✅ Filtros avanzados por tipo, fecha y palabras clave
- ✅ Búsqueda de texto libre en referencia, contenido y palabras clave
- ✅ Vista detallada de cada normativa
- ✅ Generación y descarga de PDFs con formato oficial

### Sistema de Gestión (Admin)
- ✅ Panel de administración con estadísticas
- ✅ CRUD completo de normativas
- ✅ Workflow de estados: DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
- ✅ Controles de transición de estados
- ✅ Historial de cambios de estado
- ✅ Formularios de creación y edición

### Generación de PDFs
- ✅ Template oficial con logo, encabezados y metadatos
- ✅ Contenido formateado automáticamente
- ✅ Firma digital placeholder
- ✅ Descarga directa desde el navegador

### Diseño Responsivo
- ✅ Mobile (<640px): Navegación hamburguesa, tarjetas adaptativas
- ✅ Tablet (640px-1024px): Layout optimizado
- ✅ Desktop (>1024px): Vista completa con tablas

### Sistema de Búsqueda
- ✅ Búsqueda en referencia, contenido y archivos
- ✅ Filtros por tipo (Decreto/Resolución/Ordenanza)
- ✅ Filtros por rango de fechas
- ✅ Índice de palabras clave

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 16.1.2 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Componentes UI:** Componentes personalizados basados en shadcn/ui
- **Generación PDF:** jsPDF + jspdf-autotable
- **Iconos:** lucide-react
- **Utilidades:** date-fns, clsx, tailwind-merge

## 📁 Estructura del Proyecto

```
PDRO-Project/
├── app/                          # Pages (Next.js App Router)
│   ├── admin/                    # Sección administrativa
│   │   ├── regulations/
│   │   │   ├── [id]/            # Detalle/edición de normativa
│   │   │   └── new/             # Crear nueva normativa
│   │   └── page.tsx             # Dashboard admin
│   ├── api/                     # API Routes
│   │   └── regulations/         # Endpoints de normativas
│   ├── regulations/[id]/        # Vista pública de normativa
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Portal público (home)
│   └── globals.css              # Estilos globales
├── components/                   # Componentes React
│   ├── ui/                      # Componentes UI base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── FilterBar.tsx            # Barra de filtros
│   ├── Header.tsx               # Encabezado
│   ├── Footer.tsx               # Pie de página
│   ├── RegulationsTable.tsx     # Tabla de normativas
│   └── RegulationForm.tsx       # Formulario CRUD
├── lib/                         # Utilidades y lógica
│   ├── mockData.ts              # Datos de prueba
│   ├── pdfGenerator.ts          # Generador de PDFs
│   └── utils.ts                 # Funciones auxiliares
├── types/                       # Definiciones TypeScript
│   └── index.ts                 # Tipos de normativas y workflow
└── public/                      # Archivos estáticos
```

## 🚦 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Fer22luna/PDRO-Project.git
cd PDRO-Project
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Abrir el navegador en [http://localhost:3000](http://localhost:3000)

### Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## 📊 Modelo de Datos

### Regulation (Normativa)
```typescript
{
  id: string
  type: 'DECREE' | 'RESOLUTION' | 'ORDINANCE'
  specialNumber: string
  publicationDate: Date
  reference: string
  content: string (Markdown)
  keywords: string[]
  state: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'
  stateHistory: StateTransition[]
  createdAt: Date
  updatedAt: Date
}
```

### Workflow de Estados
- **DRAFT** → REVIEW
- **REVIEW** → APPROVED | DRAFT
- **APPROVED** → PUBLISHED | REVIEW
- **PUBLISHED** → ARCHIVED

## 🔌 API Endpoints

### Normativas
- `GET /api/regulations` - Listar normativas (con filtros)
- `POST /api/regulations` - Crear normativa
- `GET /api/regulations/[id]` - Obtener normativa
- `PUT /api/regulations/[id]` - Actualizar normativa
- `DELETE /api/regulations/[id]` - Eliminar normativa
- `POST /api/regulations/[id]/transition` - Cambiar estado

## 🎨 Componentes Principales

### Públicos
- **Portal Home:** Lista de normativas publicadas con filtros
- **Regulation Detail:** Vista completa de una normativa
- **PDF Viewer:** Visualización/descarga de PDFs

### Administrativos
- **Admin Dashboard:** Estadísticas y gestión
- **Regulations Table:** Tabla con todas las normativas
- **Regulation Form:** Crear/editar normativas
- **Workflow Manager:** Control de estados y transiciones

## 📱 Responsive Design

El sistema adapta su interfaz según el dispositivo:

- **Mobile (<640px):** 
  - Menú hamburguesa
  - Tarjetas en lugar de tablas
  - Filtros colapsables

- **Tablet (640px-1024px):**
  - Layout de 2 columnas
  - Tablas con scroll horizontal

- **Desktop (>1024px):**
  - Layout completo
  - Tablas expandidas
  - Múltiples columnas

## 🔮 Próximas Funcionalidades

- [ ] Integración con base de datos (PostgreSQL/MySQL)
- [ ] Sistema de autenticación y autorización
- [ ] Gestión de roles y permisos
- [ ] Carga de archivos PDF existentes
- [ ] Editor de texto enriquecido (WYSIWYG)
- [ ] Notificaciones por email
- [ ] Auditoría completa de cambios
- [ ] Exportación masiva de normativas
- [ ] API pública REST/GraphQL
- [ ] Tests unitarios e integración

## 📄 Licencia

ISC

## 👥 Autor

Proyecto desarrollado para la gestión de normativas institucionales.

---

**Nota:** Este proyecto utiliza datos mock para demostración. Para ambiente de producción, se debe integrar con una base de datos real y sistema de autenticación.
