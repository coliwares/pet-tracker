# Getting Started

## Objetivo

Dejar el proyecto funcionando en local con Supabase y variables de entorno correctas.

## Requisitos

- Node.js 18+
- npm
- Proyecto de Supabase

## Paso a paso

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
FEEDBACK_ADMIN_EMAIL=...
```

3. Ejecuta en Supabase:

- `supabase/supabase-setup.sql`
- `supabase/20260425_add_tutor_profiles.sql`

4. Configura storage siguiendo [STORAGE_SETUP.md](STORAGE_SETUP.md).

5. Levanta la app:

```bash
npm run dev
```

## Verificacion minima

- Puedes entrar a `/login`
- Puedes autenticarte
- El dashboard carga
- Puedes crear una mascota

## Problemas comunes

### Faltan tablas

Ejecuta nuevamente los scripts SQL de `supabase/`.

### Credenciales invalidas

Revisa `.env.local` y reinicia el servidor.

### Storage no funciona

Revisa bucket, policies y MIME types permitidos.
