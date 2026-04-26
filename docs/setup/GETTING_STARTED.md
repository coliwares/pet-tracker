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

## Configuracion de email con Resend

Pet Tracker depende de Supabase Auth para los correos de autenticacion. Si quieres usar Resend como SMTP, la configuracion se hace en Supabase, no en el cliente Next.js.

### Donde impacta en esta app

- `src/lib/supabase.ts`: signup con `supabase.auth.signUp(...)`
- `src/app/api/beta-access-request/admin/route.ts`: invitaciones con `supabase.auth.admin.inviteUserByEmail(...)`

### Configuracion recomendada

1. Verifica tu dominio en Resend.
2. Crea una API key para SMTP.
3. En Supabase abre `Authentication -> Email -> SMTP Settings`.
4. Activa `Custom SMTP` y carga:

```text
Host: smtp.resend.com
Port: 587
Username: resend
Password: <api key de Resend>
```

5. En `Authentication -> URL Configuration` revisa:

- `Site URL`: `https://tu-dominio.com`
- `Redirect URLs`:
  - `http://localhost:3000/auth/callback`
  - `https://tu-dominio.com/auth/callback`

### Checklist de validacion

- Signup envia correo correctamente
- El link del correo vuelve a `/auth/callback`
- La invitacion beta abre `/auth/set-password`
- No aparecen errores de dominio no verificado ni remitente bloqueado

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
