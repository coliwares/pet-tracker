# Changelog

Todas las funcionalidades y cambios importantes del proyecto Carnet Veterinario.

---

## [1.0.0] - 2026-04-12

### ✨ Funcionalidades Implementadas (MVP Completo)

#### 🔐 Autenticación
- ✅ Registro de usuarios (signup)
- ✅ Inicio de sesión (login)
- ✅ Cierre de sesión (logout)
- ✅ Persistencia de sesión con JWT
- ✅ Validación de email y contraseña
- ✅ Rutas protegidas (redirect a login si no autenticado)

#### 🐾 Gestión de Mascotas (CRUD Completo)
- ✅ **Crear** mascota con:
  - Nombre, especie, raza
  - Fecha de nacimiento (cálculo automático de edad)
  - Peso
  - Notas (alergias, observaciones)
- ✅ **Listar** mascotas en dashboard (grid responsivo)
- ✅ **Ver detalle** de mascota con:
  - Información completa
  - Historial médico (timeline)
  - Próximas dosis/vacunas
- ✅ **Editar** mascota
- ✅ **Eliminar** mascota (con confirmación)
  - Eliminación en cascada de eventos asociados

#### 💊 Gestión de Eventos Médicos (CRUD Completo)
- ✅ **Crear** eventos con:
  - Tipo: Vacuna, Visita Veterinaria, Medicina, Otro
  - Título y descripción
  - Fecha del evento
  - Próxima dosis (fecha opcional)
  - Notas adicionales
- ✅ **Listar** eventos en timeline visual
  - Ordenados por fecha (más reciente primero)
  - Colores por tipo de evento
  - Badges de próximas dosis
- ✅ **Editar** eventos
- ✅ **Eliminar** eventos (con confirmación)

#### 🎨 Componentes UI
- ✅ Sistema de componentes reutilizables:
  - Button (variantes: primary, secondary, danger, ghost)
  - Input con validación y errores
  - Modal de confirmación
  - Loading spinner
  - Toast notifications (success, error, info)
  - EmptyState para estados vacíos
  - Container para layout consistente

#### 🔒 Seguridad
- ✅ Row Level Security (RLS) en Supabase
- ✅ Políticas de acceso por usuario
- ✅ Validación de datos en cliente
- ✅ Variables de entorno protegidas (.env.local)

#### 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Grid adaptativo (1/2/3 columnas según pantalla)
- ✅ Navegación optimizada para móvil
- ✅ Botones con tamaño mínimo táctil (44px)

#### 🎯 UX/UI
- ✅ Landing page atractiva
- ✅ Navegación intuitiva con breadcrumbs
- ✅ Estados de carga (loading states)
- ✅ Mensajes de error claros
- ✅ Confirmaciones para acciones destructivas
- ✅ Iconos Lucide React

---

## 📋 Estructura de Archivos Creados

### Configuración
- `.env.example` - Template de variables de entorno
- `supabase-setup.sql` - Script de setup de base de datos
- `GETTING_STARTED.md` - Guía de inicio rápido
- `CHANGELOG.md` - Este archivo

### Lib
- `src/lib/types.ts` - Tipos TypeScript
- `src/lib/constants.ts` - Constantes del proyecto
- `src/lib/utils.ts` - Funciones de utilidad
- `src/lib/supabase.ts` - Cliente Supabase + CRUD

### Hooks
- `src/hooks/useAuth.ts` - Hook de autenticación
- `src/hooks/usePets.ts` - Hook para mascotas
- `src/hooks/useEvents.ts` - Hook para eventos
- `src/hooks/useToast.ts` - Hook para notificaciones

### Componentes UI
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Loading.tsx`
- `src/components/ui/Container.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Toast.tsx`

### Componentes de Negocio
- `src/components/layout/Header.tsx` - Navegación global
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/pet/PetCard.tsx`
- `src/components/pet/PetForm.tsx`
- `src/components/event/EventCard.tsx`
- `src/components/event/EventForm.tsx`
- `src/components/event/Timeline.tsx`

### Páginas
- `src/app/page.tsx` - Landing page
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/dashboard/page.tsx` - Lista de mascotas
- `src/app/dashboard/new-pet/page.tsx` - Crear mascota
- `src/app/dashboard/[petId]/page.tsx` - Detalle + timeline
- `src/app/dashboard/[petId]/edit/page.tsx` - Editar mascota
- `src/app/dashboard/[petId]/events/new/page.tsx` - Crear evento
- `src/app/dashboard/[petId]/events/[eventId]/edit/page.tsx` - Editar evento

---

## 🔄 Próximas Funcionalidades (Fase 2)

### Planeadas
- [ ] Subir fotos de mascotas (Supabase Storage)
- [ ] Adjuntar archivos a eventos (PDFs, fotos)
- [ ] Recordatorios por email para próximas vacunas
- [ ] Exportar historial a PDF
- [ ] Compartir historial con veterinario (link read-only)
- [ ] Búsqueda y filtrado de eventos
- [ ] Gráficos de peso/evolución
- [ ] Modo oscuro (dark mode)

---

## 🐛 Bugs Conocidos

Ninguno reportado aún.

---

## 📊 Métricas

- **Archivos TypeScript:** 35+
- **Componentes React:** 20+
- **Páginas:** 8
- **Hooks personalizados:** 4
- **Tests de tipo:** ✅ Pasando
- **Build:** ✅ Funcional

---

## 🙏 Créditos

- **Framework:** Next.js 16
- **UI:** Tailwind CSS v4
- **Backend:** Supabase
- **Iconos:** Lucide React
- **Hosting:** Vercel
