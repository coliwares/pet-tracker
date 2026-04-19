# ✅ Implementación Paso a Paso - Pet Carnet MVP

**Estimación:** 4-5 días de desarrollo  
**Prioridad:** MVP → Validación → Escalamiento

---

## 📋 Phase 1: Setup Base (Día 1)

### 1.1 Crear proyecto Next.js
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

### 1.2 Crear estructura de carpetas
```bash
mkdir -p src/lib src/components/{layout,auth,pet,event,ui,shared} src/hooks src/contexts src/app/{api,share} src/public/icons src/tests/{unit,e2e}
```

### 1.3 Copiar archivos base
- [ ] Copiar `lib/types.ts`
- [ ] Copiar `lib/supabase.ts`
- [ ] Copiar `lib/utils.ts`
- [ ] Copiar `lib/constants.ts`
- [ ] Copiar `.env.example` y crear `.env.local`

### 1.4 Configurar Supabase
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar SQL scripts (tablas + RLS)
- [ ] Copiar SUPABASE_URL y ANON_KEY a `.env.local`

---

## 🔐 Phase 2: Autenticación (Día 1-2)

### 2.1 Crear hooks de auth
- [ ] `hooks/useAuth.ts`
- [ ] `hooks/useToast.ts` (notificaciones)

### 2.2 Componentes de auth
- [ ] `components/auth/LoginForm.tsx`
- [ ] `components/auth/SignupForm.tsx`
- [ ] `components/shared/Header.tsx` (con logout)

### 2.3 Páginas de auth
- [ ] `app/(auth)/layout.tsx`
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/signup/page.tsx`
- [ ] `app/page.tsx` (landing simple)

### 2.4 Middleware de protección
- [ ] Crear `middleware.ts` para proteger rutas `/dashboard`
- [ ] Test: signup → redirige a /dashboard
- [ ] Test: login → redirige a /dashboard
- [ ] Test: logout → redirige a /

---

## 🐾 Phase 3: Gestión de Mascotas (Día 2-3)

### 3.1 Hooks de mascotas
- [ ] `hooks/usePets.ts`

### 3.2 Componentes de mascotas
- [ ] `components/pet/PetCard.tsx`
- [ ] `components/pet/PetDetail.tsx`
- [ ] `components/pet/PetForm.tsx`
- [ ] `components/ui/Input.tsx` (componente reutilizable)
- [ ] `components/ui/Button.tsx`
- [ ] `components/shared/EmptyState.tsx`

### 3.3 Páginas de mascotas
- [ ] `app/(dashboard)/layout.tsx` (protegido)
- [ ] `app/(dashboard)/dashboard/page.tsx` (lista mascotas)
- [ ] `app/(dashboard)/dashboard/[petId]/page.tsx` (detalle)
- [ ] `app/(dashboard)/dashboard/[petId]/edit/page.tsx` (editar)
- [ ] `app/(dashboard)/new-pet/page.tsx` (crear)

### 3.4 API endpoints de mascotas
- [ ] `app/api/pets/route.ts` (GET all, POST new)
- [ ] `app/api/pets/[petId]/route.ts` (GET one, PUT update, DELETE)

### 3.5 Testing
- [ ] Test: crear mascota → aparece en dashboard
- [ ] Test: editar mascota → datos se actualizan
- [ ] Test: eliminar mascota → desaparece de lista

---

## 📅 Phase 4: Eventos (Día 3-4)

### 4.1 Hooks de eventos
- [ ] `hooks/useEvents.ts`

### 4.2 Componentes de eventos
- [ ] `components/event/EventForm.tsx`
- [ ] `components/event/EventCard.tsx`
- [ ] `components/event/Timeline.tsx` (visual)
- [ ] `components/event/EventFilter.tsx` (filtrar por tipo - opcional)

### 4.3 Páginas de eventos
- [ ] `app/(dashboard)/dashboard/[petId]/events/new/page.tsx`
- [ ] `app/(dashboard)/dashboard/[petId]/events/[eventId]/edit/page.tsx`

### 4.4 API endpoints de eventos
- [ ] `app/api/events/route.ts` (GET by petId, POST new)
- [ ] `app/api/events/[eventId]/route.ts` (GET one, PUT update, DELETE)

### 4.5 Testing
- [ ] Test: agregar evento → aparece en timeline
- [ ] Test: timeline orden DESC por fecha
- [ ] Test: próxima dosis muestra correctamente
- [ ] Test: editar evento → actualiza timeline
- [ ] Test: eliminar evento → desaparece de timeline

---

## 🎨 Phase 5: UI Polish (Día 4-5)

### 5.1 Componentes UI base
- [ ] `components/ui/Modal.tsx`
- [ ] `components/ui/Loading.tsx`
- [ ] `components/ui/Toast.tsx` (notificaciones)
- [ ] `components/ui/Select.tsx`
- [ ] `components/ui/Textarea.tsx`

### 5.2 Layout global
- [ ] `app/layout.tsx` (estilos globales, Tailwind)
- [ ] `components/shared/Container.tsx`
- [ ] Responsive design en todas las páginas

### 5.3 Iconos y assets
- [ ] Agregar iconos (lucide-react)
- [ ] Avatar placeholder para mascotas sin foto
- [ ] Logo simple

### 5.4 Mobile responsiveness
- [ ] Test en iPhone 12 (375px)
- [ ] Test en iPad (768px)
- [ ] Buttons min 44px para touch
- [ ] Forms optimizados para mobile

---

## ✅ Phase 6: QA y Testing (Día 5)

### 6.1 Casos de prueba manuales
```
Login/Signup
☐ Sign up con email válido
☐ Sign up con email existente (error)
☐ Login con credenciales correctas
☐ Login con credenciales incorrectas (error)
☐ Logout

Mascotas
☐ Crear mascota → aparece en dashboard
☐ Ver detalles mascota
☐ Editar mascota → actualiza
☐ Eliminar mascota → desaparece

Eventos
☐ Agregar evento → aparece en timeline
☐ Timeline orden DESC por fecha
☐ Próxima dosis visible
☐ Editar evento → actualiza
☐ Eliminar evento → desaparece
☐ Todos los tipos: vacuna, visita, medicina, otro

Persistencia
☐ Refresh página → datos se cargan
☐ Logout + login → mismos datos
```

### 6.2 Validaciones
- [ ] Email: formato válido
- [ ] Passwords: mín 6 caracteres
- [ ] Campos requeridos: name, species, event_date
- [ ] File upload: máx 5MB, formatos permitidos

### 6.3 Performance
- [ ] Lighthouse score > 80 en mobile
- [ ] API responses < 500ms
- [ ] Sin console errors

### 6.4 Seguridad
- [ ] RLS activo en Supabase
- [ ] Tokens no expuestos en cliente
- [ ] API keys no en repo

---

## 🚀 Phase 7: Deploy (Día 5)

### 7.1 Preparar repo
- [ ] `.gitignore` completo (node_modules, .env.local, etc)
- [ ] `README.md` con instrucciones setup
- [ ] Commit inicial: "Initial commit: pet-carnet MVP"

### 7.2 Deploy en Vercel
- [ ] Push a GitHub
- [ ] Conectar repo en vercel.com
- [ ] Agregar env vars (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY)
- [ ] Deploy automático

### 7.3 Testing en producción
- [ ] Test signup en vercel.app
- [ ] Test crear mascota y eventos
- [ ] Confirmar datos persisten en Supabase

---

## 📊 Tareas por Archivo

### `lib/` (6 archivos)
```
✓ types.ts          - Tipos TypeScript
✓ supabase.ts       - Cliente Supabase + funciones CRUD
✓ utils.ts          - Utilidades (date formatting, validation)
✓ constants.ts      - Especies, tipos eventos, colores
✓ auth.ts           - Helpers autenticación (opcional)
```

### `hooks/` (3 archivos)
```
✓ useAuth.ts        - Hook autenticación
✓ usePets.ts        - Hook CRUD mascotas
✓ useEvents.ts      - Hook CRUD eventos
✓ useToast.ts       - Hook notificaciones (opcional)
```

### `components/` (20+ archivos)
```
Layout
✓ layout/Header.tsx
✓ layout/Footer.tsx

Auth
✓ auth/LoginForm.tsx
✓ auth/SignupForm.tsx

Pet
✓ pet/PetCard.tsx
✓ pet/PetDetail.tsx
✓ pet/PetForm.tsx
✓ pet/PetPhoto.tsx

Event
✓ event/EventForm.tsx
✓ event/EventCard.tsx
✓ event/Timeline.tsx
✓ event/EventFilter.tsx

UI Base
✓ ui/Button.tsx
✓ ui/Input.tsx
✓ ui/Textarea.tsx
✓ ui/Select.tsx
✓ ui/Modal.tsx
✓ ui/Loading.tsx
✓ ui/Toast.tsx

Shared
✓ shared/Container.tsx
✓ shared/EmptyState.tsx
```

### `app/` (12+ páginas)
```
Public
✓ page.tsx                    (landing)
✓ (auth)/login/page.tsx
✓ (auth)/signup/page.tsx

Protected
✓ (dashboard)/layout.tsx
✓ (dashboard)/dashboard/page.tsx
✓ (dashboard)/dashboard/[petId]/page.tsx
✓ (dashboard)/dashboard/[petId]/edit/page.tsx
✓ (dashboard)/new-pet/page.tsx
✓ (dashboard)/dashboard/[petId]/events/new/page.tsx
✓ (dashboard)/dashboard/[petId]/events/[eventId]/edit/page.tsx
✓ (dashboard)/settings/page.tsx (opcional)

API
✓ api/pets/route.ts
✓ api/pets/[petId]/route.ts
✓ api/events/route.ts
✓ api/events/[eventId]/route.ts
✓ api/auth/logout/route.ts
```

---

## 🎯 Prioridades

### 🔴 Must Have (MVP)
1. Auth (signup/login/logout)
2. CRUD Mascotas
3. CRUD Eventos
4. Timeline visual
5. Responsive mobile
6. Deploy en Vercel

### 🟡 Should Have (Fase 2)
7. Foto mascota
8. Exportar PDF
9. Recordatorios email
10. Compartir con vet

### 🟢 Nice to Have (Fase 3+)
11. App móvil
12. Integración clínicas
13. Analytics

---

## 💡 Tips para Claude Code

1. **Componentes:** Crear primero la estructura (types), luego componentes simples, luego lógica
2. **Testing:** No escribir tests unitarios ahora, hacer testing manual
3. **Styling:** Usar clases Tailwind directo, sin extraer a CSS modules
4. **API:** API routes simples sin validación compleja (confiar en RLS de Supabase)
5. **Errores:** Mostrar toasts simples, no logs complejos
6. **Mobile:** `mobile:` prefix en Tailwind para responsive
7. **Rendimiento:** No lazy-load en MVP, todo cargue normal

---

## 🔗 Comandos Útiles

```bash
# Desarrollo
npm run dev          # http://localhost:3000

# Build
npm run build
npm run start

# Tipo checking
npm run type-check

# Linting (si instalas)
npm run lint

# Crear base de datos local (Supabase local - opcional)
npx supabase start
```

---

**Próximo paso:** Usar este `claude.md` con `claude code` para generar el proyecto completo.

Ejemplo:
```
claude code < pet-carnet-claude.md
```

O copiar el contenido en Claude Code directamente y dejarlo trabajar.
