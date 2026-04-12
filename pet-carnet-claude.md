# 🐾 Carnet Veterinario Digital - Especificación Completa

**Versión:** 1.0 MVP  
**Última actualización:** 2026-04-11  
**Estado:** Especificación para Claude Code

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Modelo de Datos](#modelo-de-datos)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Setup e Instalación](#setup-e-instalación)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Implementación Detallada](#implementación-detallada)
9. [Testing y QA](#testing-y-qa)
10. [Deployment](#deployment)

---

## 1. Resumen Ejecutivo

### Objetivo
Crear un carnet veterinario digital donde dueños de mascotas (B2C) centralicen historial médico, vacunas, medicinas y visitas veterinarias.

### MVP Scope (Fase 1)
- ✅ Autenticación (signup/login)
- ✅ CRUD mascotas (crear, listar, editar, eliminar)
- ✅ CRUD eventos (vacunas, visitas, medicinas)
- ✅ Timeline visual de eventos por mascota
- ✅ Web responsive (mobile-first)
- ✅ Gratis hasta 1000+ usuarios (free tier Supabase + Vercel)

### Stack Elegido
| Capa | Tecnología | Razón |
|------|-----------|-------|
| Frontend | Next.js 14+ React 18 | SSR, optimizado, Vercel native |
| Styling | Tailwind CSS | Utility-first, mobile-responsive |
| Auth | Supabase Auth (JWT) | Built-in, OAuth ready |
| Database | PostgreSQL (Supabase) | Relacional, escalable |
| Storage | Supabase Storage | Integrado, simple |
| Hosting | Vercel | Next.js optimizado, free tier |
| Lenguaje | TypeScript | Type-safe |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│  Browser (User Device)                              │
│  - Next.js Frontend (SSR + Client)                  │
│  - React Components (Interactive)                   │
│  - Tailwind CSS (Responsive)                        │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│  Vercel Edge (Next.js API Routes)                   │
│  - Auth middleware                                  │
│  - API endpoints (/api/*)                           │
│  - SSR/ISR rendering                                │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│  Supabase (Backend as a Service)                    │
│  ├─ Auth: JWT + OAuth                               │
│  ├─ Database: PostgreSQL                            │
│  │  ├─ users                                        │
│  │  ├─ pets                                         │
│  │  └─ events                                       │
│  └─ Storage: Fotos + PDFs                           │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
1. Usuario hace acción en UI
   ↓
2. Componente React dispara fetch (client-side o API route)
   ↓
3. Supabase SDK consulta Supabase (Auth + DB)
   ↓
4. Respuesta JSON a componente
   ↓
5. State update → re-render
```

---

## 3. Modelo de Datos

### 3.1 Tabla: `users` (Supabase Auth)
```sql
-- Gestionada por Supabase Auth
-- Campos principales:
-- id (UUID, PK)
-- email (TEXT, UNIQUE)
-- encrypted_password (TEXT)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
```

### 3.2 Tabla: `pets`
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('Perro', 'Gato', 'Conejo', 'Ave', 'Otro')),
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2), -- kg
  photo_url TEXT, -- path en Supabase Storage
  notes TEXT, -- alergias, observaciones generales
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  UNIQUE(user_id, id)
);

CREATE INDEX idx_pets_user_id ON pets(user_id);
```

### 3.3 Tabla: `events`
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vacuna', 'visita', 'medicina', 'otro')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  next_due_date DATE, -- para vacunas/medicinas recurrentes
  notes TEXT,
  file_url TEXT, -- path en Supabase Storage (receta, foto, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  UNIQUE(pet_id, id)
);

CREATE INDEX idx_events_pet_id ON events(pet_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);
```

### 3.4 Relaciones RLS (Row Level Security)

```sql
-- Solo usuarios pueden ver sus propias mascotas
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

-- Eventos: heredan restricción de mascota (pet_id)
CREATE POLICY "Users can view pet events"
  ON events FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

-- Similar para INSERT, UPDATE, DELETE
```

---

## 4. Estructura del Proyecto

```
pet-carnet/
├── .env.local                          # Variables de entorno (NO COMMIT)
├── .env.example                        # Template para .env
├── .gitignore                          # Excluir node_modules, .env, etc
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind config
├── next.config.js                      # Next.js config
├── package.json                        # Dependencias
│
├── app/                                # App Router (Next.js 13+)
│   ├── layout.tsx                      # Layout global
│   ├── page.tsx                        # Landing (/
│   ├── (auth)/                         # Rutas auth (grouped layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/                    # Rutas protegidas
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          # Lista mascotas
│   │   ├── dashboard/[petId]/
│   │   │   ├── page.tsx                # Detalle + timeline
│   │   │   ├── edit/page.tsx           # Editar mascota
│   │   │   └── events/
│   │   │       ├── new/page.tsx        # Crear evento
│   │   │       └── [eventId]/
│   │   │           └── edit/page.tsx   # Editar evento
│   │   ├── new-pet/page.tsx            # Nueva mascota
│   │   └── settings/page.tsx           # Configuración usuario
│   ├── api/                            # API Routes
│   │   ├── auth/
│   │   │   └── logout/route.ts         # POST logout
│   │   ├── pets/
│   │   │   ├── route.ts                # GET, POST pets
│   │   │   └── [petId]/route.ts        # GET, PUT, DELETE pet
│   │   ├── events/
│   │   │   ├── route.ts                # GET, POST events
│   │   │   └── [eventId]/route.ts      # GET, PUT, DELETE event
│   │   └── upload/route.ts             # POST file upload
│   └── share/
│       └── [token]/page.tsx            # Link compartido (read-only)
│
├── lib/
│   ├── supabase.ts                     # Cliente Supabase
│   ├── supabase-server.ts              # Cliente Server (SSR)
│   ├── auth.ts                         # Helpers auth
│   ├── types.ts                        # TypeScript types
│   ├── utils.ts                        # Funciones útiles
│   └── constants.ts                    # Constantes (species, event types)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx                  # Nav global
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx                 # (opcional para desktop)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx          # HOC para rutas
│   ├── pet/
│   │   ├── PetCard.tsx
│   │   ├── PetDetail.tsx
│   │   ├── PetForm.tsx
│   │   └── PetPhoto.tsx
│   ├── event/
│   │   ├── EventForm.tsx
│   │   ├── EventCard.tsx
│   │   ├── Timeline.tsx
│   │   └── EventFilter.tsx             # Filtrar por tipo
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── Toast.tsx                   # Notificaciones
│   └── shared/
│       ├── Container.tsx               # Max-width wrapper
│       └── EmptyState.tsx              # Cuando no hay datos
│
├── hooks/
│   ├── useAuth.ts                      # Contexto/hook auth
│   ├── usePets.ts                      # Fetch/manage pets
│   ├── useEvents.ts                    # Fetch/manage events
│   └── useToast.ts                     # Notificaciones
│
├── contexts/
│   └── AuthContext.tsx                 # Proveedor auth (optional)
│
├── public/
│   ├── logo.svg
│   ├── icons/
│   └── images/
│
└── tests/
    ├── unit/
    │   └── utils.test.ts
    └── e2e/
        └── auth.spec.ts                # Playwright tests
```

---

## 5. Componentes Principales

### 5.1 Auth Flow

**Entrada:**
- Landing page (/) → Links a login/signup
- Sign up: email + password (validación básica)
- Login: email + password
- Logout: botón en header

**Persistencia:**
- Supabase Auth maneja JWT automáticamente
- localStorage (handled by Supabase SDK)
- Al refresh: se valida token

### 5.2 Dashboard

**URL:** `/dashboard`

```typescript
// Muestra:
- Header con usuario logueado + botón logout
- Grid de mascotas (cards)
- Botón "+ Nueva mascota"
- Si no hay mascotas: empty state
```

### 5.3 Pet Detail

**URL:** `/dashboard/[petId]`

```typescript
// Muestra:
- Info mascota (foto, nombre, raza, edad, peso)
- Botón editar
- Timeline de eventos (DESC por fecha)
- Botón "+ Agregar evento"
- Próximas dosis (vacunas/medicinas)
```

### 5.4 Event Form

**Campos:**
- Tipo: selector (vacuna, visita, medicina, otro)
- Título: input text
- Fecha: date picker
- Descripción: textarea
- Próxima dosis: date picker (opcional)
- Notas: textarea
- Archivo: upload (opcional)

---

## 6. Setup e Instalación

### 6.1 Prerequisites
```
- Node.js 18+ (verificar con `node -v`)
- npm 9+ (o yarn/pnpm)
- Git
- Cuenta Supabase (free tier)
- Cuenta Vercel (free tier)
```

### 6.2 Pasos Iniciales

#### A. Crear proyecto Supabase
```bash
1. Ir a https://supabase.com
2. Sign up (cuenta gratis)
3. Crear nuevo proyecto
4. Nombre: "pet-carnet" | Region: más cercana
5. Guardar password (seguro)
6. Copiar SUPABASE_URL y ANON_KEY (en Settings → API)
```

#### B. Crear tablas en Supabase
```sql
-- Ir a SQL Editor en Supabase console
-- Ejecutar estos scripts:

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

-- Policies para events (heredan via pet_id)
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

#### C. Crear proyecto Next.js
```bash
npx create-next-app@latest pet-carnet \
  --typescript \
  --tailwind \
  --app \
  --no-eslint \
  --src-dir \
  --import-alias '@/*'

cd pet-carnet
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs date-fns lucide-react
```

#### D. Configurar variables de entorno
```bash
# Copiar .env.example a .env.local
cp .env.example .env.local

# Editar .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (obtener de Supabase > Settings > API)
```

#### E. Estructura de carpetas
```bash
# Ejecutar desde raíz del proyecto:
mkdir -p lib components hooks contexts public/icons tests/{unit,e2e}
```

---

## 7. Flujos de Usuario

### 7.1 Signup (Nuevo usuario)
```
1. User → Landing (/)
2. Click "Registrarse" → /signup
3. Form: email + password
4. Enviar → Supabase Auth crea usuario
5. Redirige a /dashboard (vacío)
```

### 7.2 Login (Usuario existente)
```
1. User → Landing (/)
2. Click "Ingresar" → /login
3. Form: email + password
4. Enviar → Supabase Auth valida
5. Redirige a /dashboard
```

### 7.3 Crear Mascota
```
1. En /dashboard, click "+ Nueva mascota"
2. Form: nombre, especie, raza, edad, peso, foto
3. Enviar → POST /api/pets
4. Guardar en DB
5. Redirige a /dashboard/[petId]
```

### 7.4 Agregar Evento
```
1. En /dashboard/[petId], click "+ Agregar evento"
2. Form: tipo, título, fecha, descripción, próxima, notas
3. Enviar → POST /api/events
4. Guardar en DB
5. Timeline se actualiza automáticamente
```

### 7.5 Logout
```
1. Header → Click avatar/botón logout
2. POST /api/auth/logout
3. Supabase Auth invalida sesión
4. Redirige a / (landing)
```

---

## 8. Implementación Detallada

### 8.1 lib/types.ts
```typescript
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Species = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otro';

export type Pet = {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed: string;
  birth_date: string | null;
  weight: number | null;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventType = 'vacuna' | 'visita' | 'medicina' | 'otro';

export type Event = {
  id: string;
  pet_id: string;
  type: EventType;
  title: string;
  description: string | null;
  event_date: string;
  next_due_date: string | null;
  notes: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthUser = {
  id: string;
  email: string | undefined;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
};
```

### 8.2 lib/supabase.ts (Client-side)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fetches
export async function getPets(userId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPet(petId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();
  if (error) throw error;
  return data;
}

export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pets')
    .insert([pet])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePet(petId: string, updates: Partial<Pet>) {
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', petId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePet(petId: string) {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);
  if (error) throw error;
}

export async function getEvents(petId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('pet_id', petId)
    .order('event_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(eventId: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
  if (error) throw error;
}

// Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
```

### 8.3 lib/utils.ts
```typescript
import { formatDate as fnFormatDate, format, isPast, isSameDay, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'd MMM yyyy', { locale: es });
}

export function formatDateMonthYear(dateString: string): string {
  return format(new Date(dateString), 'MMMM yyyy', { locale: es });
}

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), new Date(birthDate));
}

export function isPastDate(dateString: string): boolean {
  return isPast(new Date(dateString));
}

export function isSameDayDate(dateString1: string, dateString2: string): boolean {
  return isSameDay(new Date(dateString1), new Date(dateString2));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}
```

### 8.4 lib/constants.ts
```typescript
export const SPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'] as const;

export const EVENT_TYPES = ['vacuna', 'visita', 'medicina', 'otro'] as const;

export const EVENT_TYPE_LABELS = {
  vacuna: 'Vacuna',
  visita: 'Visita Veterinaria',
  medicina: 'Medicina',
  otro: 'Otro',
} as const;

export const EVENT_TYPE_COLORS = {
  vacuna: 'bg-blue-100 text-blue-800 border-blue-300',
  visita: 'bg-green-100 text-green-800 border-green-300',
  medicina: 'bg-orange-100 text-orange-800 border-orange-300',
  otro: 'bg-gray-100 text-gray-800 border-gray-300',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
```

### 8.5 hooks/useAuth.ts
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return { user, loading, error, signOut };
}
```

### 8.6 hooks/usePets.ts
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Pet } from '@/lib/types';
import { supabase, getPets, createPet, updatePet, deletePet } from '@/lib/supabase';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const data = await getPets(user.id);
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const add = async (pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
    const newPet = await createPet(pet);
    setPets([newPet, ...pets]);
    return newPet;
  };

  const update = async (petId: string, updates: Partial<Pet>) => {
    const updated = await updatePet(petId, updates);
    setPets(pets.map(p => p.id === petId ? updated : p));
    return updated;
  };

  const remove = async (petId: string) => {
    await deletePet(petId);
    setPets(pets.filter(p => p.id !== petId));
  };

  return { pets, loading, error, fetchPets, add, update, remove };
}
```

### 8.7 hooks/useEvents.ts
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/lib/types';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase';

export function useEvents(petId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(petId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) fetchEvents();
  }, [petId]);

  const add = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent = await createEvent(event);
    setEvents([newEvent, ...events]);
    return newEvent;
  };

  const update = async (eventId: string, updates: Partial<Event>) => {
    const updated = await updateEvent(eventId, updates);
    setEvents(events.map(e => e.id === eventId ? updated : e));
    return updated;
  };

  const remove = async (eventId: string) => {
    await deleteEvent(eventId);
    setEvents(events.filter(e => e.id !== eventId));
  };

  return { events, loading, error, fetchEvents, add, update, remove };
}
```

---

## 9. Testing y QA

### 9.1 Casos de Prueba Críticos

| ID | Funcionalidad | Pasos | Resultado Esperado |
|----|---------------|-------|-------------------|
| TC001 | Sign Up | 1. Ir a /signup<br>2. Email + password<br>3. Submit | Usuario creado, redirige a /dashboard |
| TC002 | Login | 1. Ir a /login<br>2. Email + password existente<br>3. Submit | Valida, redirige a /dashboard |
| TC003 | Login inválido | 1. /login<br>2. Email + password incorrecto<br>3. Submit | Error message, permanece en /login |
| TC004 | Nueva mascota | 1. /dashboard<br>2. Click "+ Nueva"<br>3. Llenar form<br>4. Submit | Mascota aparece en grid |
| TC005 | Ver mascota | 1. Click en mascota<br>2. Ver detalles | Timeline vacío (sin eventos) |
| TC006 | Agregar evento | 1. En pet detail<br>2. "+ Agregar evento"<br>3. Llenar form<br>4. Submit | Evento aparece en timeline DESC por fecha |
| TC007 | Timeline orden | 1. Agregar 3+ eventos con fechas diferentes<br>2. Ver timeline | Eventos DESC (más reciente primero) |
| TC008 | Próxima dosis | 1. Evento con "Próxima dosis"<br>2. Ver en timeline | Muestra badge/label "Próximo: DD/MM" |
| TC009 | Logout | 1. Header<br>2. Click logout<br>3. Redirige | Sesión invalida, redirije a / |
| TC010 | Persistencia | 1. Login<br>2. Refresh página<br>3. Ver /dashboard | Mascotas se cargan automáticamente |

### 9.2 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigation |
|--------|-------------|--------|------------|
| **Pérdida de datos** | Baja | Crítico | Backups Supabase (automáticos), Test integridad DB |
| **Auth no persiste tras refresh** | Media | Alto | Usar Supabase SDK (JWT en localStorage) |
| **Foto corrupta cuelga upload** | Baja | Medio | Validar file size/type en client, timeout en servidor |
| **Timeline no se actualiza** | Baja | Medio | Refetch automático tras crear evento |
| **Date picker inválido en mobile** | Media | Bajo | Usar `<input type="date">` nativo |

### 9.3 Edge Cases

```
✓ Mascota sin foto → mostrar avatar placeholder
✓ Evento sin descripción → mostrar solo título
✓ Usuario con muchas mascotas (100+) → paginación/scroll infinito
✓ Evento muy antiguo (años) → scrolleable sin lag
✓ Caracteres especiales en título → sanitizar/escapar
✓ Password débil → validar regex (min 6 chars)
✓ Email inválido → validar regex
✓ Archivo muy grande (>5MB) → error message
✓ Navegador sin JS → fallback (form básico funciona)
```

---

## 10. Deployment

### 10.1 Checklist Pre-Deploy

```
CODE
☐ TypeScript: sin errores (npm run type-check)
☐ Componentes: renderean sin errores
☐ Auth: signup/login/logout funciona
☐ CRUD pets: crear, leer, actualizar, eliminar
☐ CRUD events: crear, leer, actualizar, eliminar
☐ Timeline: visual correcto, orden DESC

ENV VARS
☐ .env.local contiene SUPABASE_URL y ANON_KEY
☐ .env.example documentado (sin valores)

SECURITY
☐ RLS habilitado en Supabase (pets, events)
☐ Contraseñas no en logs
☐ API keys no commiteadas
☐ HTTPS en conexiones

MOBILE
☐ Responsive en mobile (375px width)
☐ Buttons clickeables (min 44px)
☐ Formularios mobile-friendly

DATABASE
☐ Índices en user_id, pet_id, event_date
☐ Constraints: NOT NULL, FK, CHECK
☐ Timestamps: created_at, updated_at

TESTING
☐ Sign up → OK
☐ Add pet → OK
☐ Add event → OK
☐ Timeline se actualiza → OK
☐ Logout → OK
```

### 10.2 Deploy en Vercel

```bash
# 1. Push a GitHub
git add .
git commit -m "Initial commit: pet-carnet MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USER/pet-carnet.git
git push -u origin main

# 2. Vercel
- Ir a https://vercel.com
- Sign up con GitHub
- Import repo "pet-carnet"
- Add Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Deploy

# 3. Dominio personalizado (opcional)
- Vercel Settings > Domains
- Agregar dominio o usar subdomain free (xxx.vercel.app)
```

### 10.3 Configuración Supabase para Producción

```
1. Supabase Console > Settings > Auth
   ✓ Email Confirmation: OFF (para MVP, no requiere confirmar email)
   ✓ Session Timeout: 1 hora
   ✓ JWT Expiry: 1 hora

2. Storage Buckets
   ✓ Crear bucket: "pet-photos"
   ✓ Access: Private
   ✓ Max file size: 5MB

3. Backups
   ✓ Supabase automáticamente hace backups
   ✓ Verificar en Settings > Backups
```

### 10.4 CI/CD (Opcional para MVP)

```bash
# Agregar GitHub Actions para testing
# .github/workflows/test.yml

name: Test & Deploy

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
```

---

## 📚 Recursos Adicionales

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Herramientas
- [Vercel CLI](https://vercel.com/docs/cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)

---

## 🔄 Evolución (Roadmap)

### Fase 2 (Semanas 3-6): Validación
- [ ] Subir foto de mascota
- [ ] Recordatorios por email
- [ ] Exportar PDF historial
- [ ] Compartir con vet (link read-only)
- [ ] Búsqueda/filtro eventos

### Fase 3 (Semanas 7+): Tracción
- [ ] QR compartible
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Integración clínicas vet

### Fase 4 (Si escalamos): Enterprise
- [ ] Dashboard analítico
- [ ] Integración facturación
- [ ] API para vets
- [ ] SSO corporativo

---

**Última actualización:** 2026-04-11  
**Versión:** 1.0 - MVP  
**Mantenedor:** Tu nombre aquí
