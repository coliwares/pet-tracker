# 🚀 Guía de Inicio Rápido

## 📝 Checklist de Setup

### 1. Configurar Supabase (5 minutos)

- [ ] Ir a [supabase.com](https://supabase.com) y crear cuenta
- [ ] Crear nuevo proyecto (ej: "pet-carnet")
- [ ] Esperar a que el proyecto esté listo
- [ ] Ir a **SQL Editor** → **New Query**
- [ ] Copiar y pegar el contenido de `supabase-setup.sql`
- [ ] Ejecutar el script (botón RUN)
- [ ] Ir a **Settings → API** y copiar:
  - `URL` (Project URL)
  - `anon public` (Project API keys)

### 2. Configurar Variables de Entorno (1 minuto)

```bash
# Crear archivo .env.local
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Ejecutar el Proyecto (30 segundos)

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

---

## ✅ Verificar que Funciona

1. **Landing Page** - Debería verse la página principal con "Carnet Veterinario Digital"
2. **Registro** - Click en "Registrarse" → Crear cuenta con email y contraseña
3. **Dashboard** - Después de registrarse, deberías ver el dashboard vacío
4. **Nueva Mascota** - Click en "Nueva Mascota" → Llenar formulario → Guardar
5. **Ver Mascota** - Click en la tarjeta de la mascota → Ver detalles
6. **Nuevo Evento** - Click en "Agregar Evento" → Crear vacuna/visita → Guardar
7. **Timeline** - Verificar que el evento aparece en la timeline

---

## 🐛 Problemas Comunes

### Error: "Invalid API key"
- Verificar que copiaste correctamente las credenciales de Supabase
- Asegurarte de que el archivo se llama `.env.local` (no `.env`)
- Reiniciar el servidor (`Ctrl+C` y luego `npm run dev`)

### Error: "relation pets does not exist"
- Ejecutar el script SQL en Supabase (`supabase-setup.sql`)
- Verificar en Supabase → Table Editor que existen las tablas `pets` y `events`

### No puedo ver las mascotas de otros usuarios (esto es correcto!)
- Row Level Security (RLS) está activado
- Cada usuario solo puede ver sus propias mascotas
- Esto es una característica de seguridad, no un bug

### La página se queda en "Cargando..."
- Abrir DevTools (F12) → Console para ver errores
- Verificar que las credenciales de Supabase son correctas
- Verificar que tienes conexión a internet

---

## 🎨 Personalización

### Cambiar colores
Editar `src/app/globals.css` y cambiar los colores de Tailwind.

### Agregar más especies
Editar `src/lib/constants.ts` → Array `SPECIES`

### Agregar más tipos de eventos
Editar `src/lib/constants.ts` → Arrays `EVENT_TYPES` y `EVENT_TYPE_LABELS`

---

## 📱 Próximos Pasos (Fase 2)

- [ ] Subir fotos de mascotas (Supabase Storage)
- [ ] Editar/Eliminar mascotas y eventos
- [ ] Filtrar eventos por tipo
- [ ] Exportar historial a PDF
- [ ] Compartir con veterinario (link read-only)

---

## 🆘 Ayuda

- **Documentación Completa:** Ver `pet-carnet-claude.md`
- **Guía de Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Guía de Next.js:** [nextjs.org/docs](https://nextjs.org/docs)

¡Listo! 🎉
