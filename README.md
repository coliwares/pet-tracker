# 🐾 Carnet Veterinario Digital

Aplicación web para gestionar el historial médico, vacunas y visitas veterinarias de tus mascotas.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **Hosting:** Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

## 🔧 Instalación y Setup

### 1. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar este script para crear las tablas:

```sql
-- Tabla pets
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  photo_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pets_user_id ON pets(user_id);

-- Tabla events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_pet_id ON events(pet_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies para pets
CREATE POLICY "Users can view own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para events
CREATE POLICY "Users can view pet events"
  ON events FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pet events"
  ON events FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pet events"
  ON events FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pet events"
  ON events FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );
```

3. Ir a **Settings → API** y copiar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 2. Configurar el proyecto local

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📱 Funcionalidades MVP

- ✅ Autenticación (signup/login/logout)
- ✅ CRUD de mascotas
- ✅ CRUD de eventos médicos (vacunas, visitas, medicinas)
- ✅ Timeline visual de eventos
- ✅ Responsive design (mobile-first)

## 🚢 Deploy en Vercel

1. Push tu código a GitHub
2. Conectar el repo en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático en cada push a `main`

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

- Row Level Security (RLS) habilitado en Supabase
- Usuarios solo pueden ver/editar sus propias mascotas
- Variables de entorno no commiteadas (.env.local en .gitignore)

## 📝 Licencia

MIT
