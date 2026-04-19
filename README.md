# 🐾 Carnet Veterinario Digital

> Aplicación web moderna para gestionar el historial médico, vacunas y visitas veterinarias de tus mascotas. Diseñada con seguridad y UX en mente.

---

## 🚀 Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Seguridad** | RLS + Rate Limiting + Honeypot |
| **Hosting** | Vercel (recomendado) |

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

## 🔧 Instalación y Setup

### 1. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)

2. **Configurar Base de Datos:**
   
   Ir a **SQL Editor** y ejecutar el script:
   ```bash
   # Copia el contenido de supabase/supabase-setup.sql
   # y ejecútalo en el SQL Editor de Supabase
   ```
   
   El script crea:
   - ✅ Tablas `pets`, `events` y `feedback`
   - ✅ Row Level Security (RLS) habilitado
   - ✅ Policies para aislamiento por usuario
   - ✅ Índices para rendimiento

3. **Configurar Storage (para fotos):**
   
   Ver guía completa en: [docs/setup/STORAGE_SETUP.md](docs/setup/STORAGE_SETUP.md)
   
   Resumen:
   - Crear bucket `pet-photos` (publico)
   - Configurar 4 policies de seguridad
   - Límite: 5MB por archivo, formatos: JPG, PNG, WebP

4. **Obtener Credenciales:**
   
   Ir a **Settings → API** y copiar:
   - `Project URL`
   - `anon/public key`

### 2. Configurar el proyecto local

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local en la raíz del proyecto
touch .env.local
ni .env.local -ItemType File
```

Editar `.env.local` con tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
FEEDBACK_ADMIN_EMAIL=admin@tu-dominio.com
```

⚠️ **Importante:** Nunca subas `.env.local` a GitHub (ya está en `.gitignore`)

Si ya tenías una base creada antes de este cambio, ejecuta nuevamente la parte de `feedback` del archivo `supabase/supabase-setup.sql` para crear la nueva tabla y sus policies.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### 4. Helpers de Desarrollo

En modo desarrollo, el proyecto incluye utilidades para facilitar el testing:

- **Auto-generación de emails únicos:** Evita rate limits de Supabase
- **Truco Gmail +alias:** `test+1@gmail.com`, `test+2@gmail.com` (todos van al mismo inbox)
- **Logs de desarrollo:** Información útil en consola

Ver: [docs/archive/RATE_LIMIT_FIX.md](docs/archive/RATE_LIMIT_FIX.md) para más detalles

## 📱 Funcionalidades

### Gestión
- ✅ Autenticación completa (signup/login/logout)
- ✅ CRUD de mascotas (crear, editar, eliminar, listar)
- ✅ CRUD de eventos médicos (vacunas, visitas, medicinas, otros)
- ✅ Feedback de usuarios para bugs y mejoras
- ✅ Panel administrativo global para gestionar feedback
- ✅ Timeline visual ordenada por fecha
- ✅ Cálculo automático de edad de mascotas
- 📸 Upload de fotos de mascotas
- 📄 Upload de licencias de registro municipal
- 🗜️ Compresión automática de imágenes

### Seguridad
- 🛡️ Rate limiting (3 intentos/min signup, 5 intentos/min login)
- 🛡️ Honeypot anti-bot
- 🛡️ Row Level Security (RLS) en Supabase
- 🛡️ Aislamiento total por usuario
- 🔐 Variables de entorno protegidas

### Diseño
- 🎨 Diseño moderno con gradientes
- ✨ Animaciones suaves
- 📱 Responsive design (mobile-first)
- 😊 Interfaz mejorada con emojis
- 💡 Hints contextuales en formularios

## 🚢 Deploy en Vercel

### Antes de hacer deploy:

⚠️ **Verificar que `.env.local` NO esté en el repositorio:**

```bash
# Verificar archivos a commitear
git status

# ❌ Si ves .env.local, DETENTE
# ✅ Si solo ves archivos de código, continúa
```

### Pasos para deploy:

1. **Push a GitHub** (ver sección "Subir a GitHub" abajo)
2. **Conectar repo** en [vercel.com](https://vercel.com)
3. **Agregar variables de entorno** en Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` → Tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Tu anon key
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` → Tu Measurement ID de GA4
   - `SUPABASE_SERVICE_ROLE_KEY` → Tu service role key
   - `FEEDBACK_ADMIN_EMAIL` → Email de la cuenta administradora de feedback
4. **Deploy** → Automático en cada push a `main`

### Subir a GitHub (primera vez):

```bash
# 1. Agregar archivos
git add .

# 2. Verificar (NO debe aparecer .env.local)
git status

# 3. Commit
git commit -m "feat: carnet veterinario MVP completo"

# 4. Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/pet-carnet.git

# 5. Push
git branch -M main
git push -u origin main
```

## 📂 Estructura del Proyecto

```
pet-carnet/
├── src/
│   ├── app/                 # Pages (Next.js App Router)
│   │   ├── page.tsx         # Landing page
│   │   ├── login/          
│   │   ├── signup/         
│   │   └── dashboard/      
│   ├── components/          # React components
│   │   ├── ui/             # UI components
│   │   ├── auth/           # Auth forms
│   │   ├── pet/            # Pet components
│   │   ├── event/          # Event components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePets.ts
│   │   └── useEvents.ts
│   └── lib/                # Utilities
│       ├── supabase.ts     # Supabase client
│       ├── types.ts        # TypeScript types
│       ├── constants.ts
│       └── utils.ts
└── public/                 # Static assets
```

## 🔐 Seguridad

- **Row Level Security (RLS):** Aislamiento total a nivel de base de datos
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **Honeypot:** Detección de bots automatizados
- **Variables de entorno:** Credenciales protegidas (nunca en el código)
- **Validaciones:** Email y contraseñas validadas en frontend y backend

Ver más detalles en: [docs/setup/SECURITY_IMPROVEMENTS.md](docs/setup/SECURITY_IMPROVEMENTS.md)

## 📚 Documentación

- **[docs/README.md](docs/README.md)** - Índice general de documentación
- **[docs/setup/GETTING_STARTED.md](docs/setup/GETTING_STARTED.md)** - Guía de inicio rápido
- **[docs/testing/TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md)** - 56 casos de prueba
- **[docs/setup/SECURITY_IMPROVEMENTS.md](docs/setup/SECURITY_IMPROVEMENTS.md)** - Medidas de seguridad
- **[docs/archive/RATE_LIMIT_FIX.md](docs/archive/RATE_LIMIT_FIX.md)** - Solución a rate limits en testing
- **[docs/design/DESIGN_UPDATE.md](docs/design/DESIGN_UPDATE.md)** - Guía de diseño visual
- **[docs/design/FORMS_UPDATE.md](docs/design/FORMS_UPDATE.md)** - Mejoras en formularios

## 🧪 Testing

```bash
# Ver guía completa de testing
cat docs/testing/TESTING_GUIDE.md

# El proyecto incluye 56 casos de prueba que cubren:
# - Autenticación (11 tests)
# - CRUD Mascotas (10 tests)
# - CRUD Eventos (10 tests)
# - UI/UX (10 tests)
# - Seguridad (7 tests)
# - Edge Cases (8 tests)
```

### Testing automatizado E2E

```bash
# Suite Playwright
npm run test:e2e

# UI interactiva
npm run test:e2e:ui

# Navegador visible
npm run test:e2e:headed
```

La configuración vive en `playwright.config.ts` y las suites iniciales están en `tests/e2e/`.
Por defecto usan la cuenta demo `test@pettrack.cl / pettrack`, pero puedes sobreescribirla con:

```bash
PLAYWRIGHT_DEMO_EMAIL=tu-email
PLAYWRIGHT_DEMO_PASSWORD=tu-password
```

## 📝 Licencia

MIT
