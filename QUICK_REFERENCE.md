# ⚡ Referencia Rápida - Carnet Veterinario

Guía visual de comandos y rutas más comunes.

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev              # Ejecutar en http://localhost:3000

# Producción
npm run build            # Compilar para producción
npm start                # Ejecutar build de producción

# Testing
npm run type-check       # Verificar tipos TypeScript
```

---

## 🗺️ Mapa de Rutas

### Públicas (No requieren login)
```
/                        → Landing page
/login                   → Iniciar sesión
/signup                  → Crear cuenta
```

### Privadas (Requieren login)
```
/dashboard               → Lista de mascotas
/dashboard/new-pet       → Crear nueva mascota
/dashboard/{petId}       → Detalle de mascota + timeline
/dashboard/{petId}/edit  → Editar mascota
/dashboard/{petId}/events/new              → Crear evento médico
/dashboard/{petId}/events/{eventId}/edit   → Editar evento
```

---

## 📁 Archivos Clave

### Configuración
```
.env.local               ← Variables de entorno (NO commitear)
.env.example             ← Template de .env
supabase-setup.sql       ← Script SQL para Supabase
```

### Documentación
```
README.md                ← Docs completa
GETTING_STARTED.md       ← Setup en 5 min
TESTING_GUIDE.md         ← Casos de prueba
CHANGELOG.md             ← Historial de cambios
MVP_COMPLETADO.md        ← Resumen ejecutivo
QUICK_REFERENCE.md       ← Este archivo
```

### Código
```
src/lib/supabase.ts      ← Cliente Supabase + funciones CRUD
src/lib/types.ts         ← Tipos TypeScript
src/hooks/useAuth.ts     ← Hook de autenticación
src/hooks/usePets.ts     ← Hook de mascotas
src/hooks/useEvents.ts   ← Hook de eventos
```

---

## 🔑 Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Opcional
```

**Dónde obtenerlas:**
1. Ir a [supabase.com](https://supabase.com)
2. Settings → API
3. Copiar "Project URL" y "anon public"

---

## 🗄️ Base de Datos

### Tablas

**pets**
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT, NOT NULL)
- species (TEXT, NOT NULL)
- breed (TEXT)
- birth_date (DATE)
- weight (DECIMAL)
- photo_url (TEXT)
- notes (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**events**
```sql
- id (UUID, PK)
- pet_id (UUID, FK → pets, CASCADE)
- type (TEXT, NOT NULL)
- title (TEXT, NOT NULL)
- description (TEXT)
- event_date (DATE, NOT NULL)
- next_due_date (DATE)
- notes (TEXT)
- file_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Políticas RLS

```sql
-- Usuarios solo ven sus propias mascotas
CREATE POLICY "Users can view own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

-- Eventos heredan restricción vía pet_id
CREATE POLICY "Users can view pet events"
  ON events FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );
```

---

## 🎨 Componentes Disponibles

### UI Base
```tsx
<Button variant="primary|secondary|danger|ghost" size="sm|md|lg">
  Click me
</Button>

<Input
  label="Nombre"
  error="Error message"
  type="text"
/>

<Modal
  isOpen={true}
  onClose={handleClose}
  title="Confirmar"
  confirmLabel="Sí"
  onConfirm={handleConfirm}
>
  Content
</Modal>

<Loading text="Cargando..." />

<EmptyState
  title="No hay datos"
  description="Agrega tu primer item"
  actionLabel="Agregar"
  onAction={handleAdd}
/>

<Toast
  message="Éxito"
  type="success|error|info"
  onClose={handleClose}
/>
```

### Componentes de Negocio
```tsx
<PetCard pet={petData} />

<PetForm
  pet={existingPet}  // Opcional para editar
  onSubmit={handleSubmit}
  submitLabel="Guardar"
/>

<EventCard event={eventData} />

<EventForm
  petId={petId}
  event={existingEvent}  // Opcional para editar
  onSubmit={handleSubmit}
  submitLabel="Crear"
/>

<Timeline events={eventsArray} />
```

---

## 🪝 Hooks Disponibles

### useAuth
```tsx
const { user, loading, error, signOut } = useAuth();

// user: null | AuthUser
// loading: boolean
// error: string | null
// signOut: () => Promise<void>
```

### usePets
```tsx
const { pets, loading, error, fetchPets, add, update, remove } = usePets();

// pets: Pet[]
// add: (data) => Promise<Pet>
// update: (id, data) => Promise<Pet>
// remove: (id) => Promise<void>
```

### useEvents
```tsx
const { events, loading, error, fetchEvents, add, update, remove } = useEvents(petId);

// events: Event[]
// add: (data) => Promise<Event>
// update: (id, data) => Promise<Event>
// remove: (id) => Promise<void>
```

### useToast
```tsx
const { toast, showToast, hideToast } = useToast();

showToast('Guardado correctamente', 'success');
showToast('Error al guardar', 'error');
```

---

## 🔧 Funciones CRUD (Supabase)

```typescript
// Auth
await signUp(email, password)
await signIn(email, password)
await signOut()
await getCurrentUser()

// Pets
await getPets(userId)
await getPet(petId)
await createPet(petData)
await updatePet(petId, updates)
await deletePet(petId)

// Events
await getEvents(petId)
await createEvent(eventData)
await updateEvent(eventId, updates)
await deleteEvent(eventId)

// Storage (para futuro)
await uploadFile(bucket, path, file)
getPublicUrl(bucket, path)
```

---

## 🎯 Tipos Principales

```typescript
type Species = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otro';

type EventType = 'vacuna' | 'visita' | 'medicina' | 'otro';

type Pet = {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed: string | null;
  birth_date: string | null;
  weight: number | null;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Event = {
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
```

---

## 🐛 Troubleshooting Común

### Error: "Invalid API key"
```bash
# Verificar .env.local
cat .env.local

# Reiniciar servidor
# Ctrl+C
npm run dev
```

### Error: "relation pets does not exist"
```sql
-- Ejecutar en Supabase SQL Editor
-- Copiar contenido de supabase-setup.sql
```

### Error: No veo mis mascotas
```bash
# Verificar en Supabase:
# 1. Table Editor → pets
# 2. Ver si user_id coincide con tu ID de usuario
# 3. Verificar que RLS esté habilitado
```

### Build Error
```bash
# Limpiar cache
rm -rf .next
npm run build
```

---

## 📱 Testing Rápido

```bash
# 1. Verificar tipos
npm run type-check

# 2. Verificar build
npm run build

# 3. Testing manual básico
# ✓ Registro nuevo usuario
# ✓ Crear mascota
# ✓ Crear evento
# ✓ Ver timeline
# ✓ Logout/Login
```

---

## 🚀 Deploy en Vercel

```bash
# 1. Push a GitHub
git add .
git commit -m "MVP ready"
git push

# 2. Vercel.com
# - Import repository
# - Add env vars (NEXT_PUBLIC_SUPABASE_*)
# - Deploy

# 3. Resultado
# https://tu-proyecto.vercel.app
```

---

## 📊 Métricas

| Métrica | Comando |
|---------|---------|
| **Lines of Code** | `cloc src/` |
| **Type Check** | `npm run type-check` |
| **Build Size** | `npm run build` |
| **Dependencies** | `npm list --depth=0` |

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **TypeScript Docs:** https://typescriptlang.org/docs

---

**Última actualización:** 2026-04-12  
**Versión:** 1.0.0
