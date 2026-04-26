# Pet Tracker

Aplicacion web para gestionar mascotas, eventos medicos y enlaces compartidos de lectura.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + Postgres + Storage
- Tailwind CSS v4
- Playwright para E2E

## Estado actual

- Autenticacion con Supabase
- Dashboard de mascotas
- CRUD de mascotas y eventos
- Perfil del tutor
- Enlaces compartidos de solo lectura
- Feedback de usuarios y panel admin
- Upload de imagenes con validaciones

## Inicio rapido

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
FEEDBACK_ADMIN_EMAIL=...
```

3. Configura Supabase ejecutando:

- `supabase/supabase-setup.sql`
- `supabase/supabase-storage-policies.sql` si aplica en tu entorno
- `supabase/20260425_add_tutor_profiles.sql` para el perfil del tutor

4. Levanta el proyecto:

```bash
npm run dev
```

## Comandos utiles

```bash
npm run dev
npm run type-check
npm run lint
npm run test
```

## SMTP con Resend

Este proyecto no usa un mailer propio para autenticacion. Los correos de registro, confirmacion e invitaciones salen desde Supabase Auth, por lo que Resend debe configurarse como proveedor SMTP dentro de Supabase.

Pasos recomendados:

1. Verifica tu dominio en Resend y crea una API key solo para SMTP.
2. En Supabase ve a `Authentication -> Email -> SMTP Settings` y habilita `Custom SMTP`.
3. Usa las credenciales SMTP de Resend:

```text
Host: smtp.resend.com
Port: 587
Username: resend
Password: <tu api key de Resend>
```

4. En `Authentication -> URL Configuration` define correctamente:
   - `Site URL`: la URL publica de la app en Vercel
   - `Redirect URLs`: incluye `http://localhost:3000/auth/callback` y tu dominio productivo con `/auth/callback`
5. Prueba estos flujos despues del cambio:
   - signup normal
   - email de confirmacion
   - invitacion beta desde el panel admin
   - recuperacion o cambio de password si lo habilitas

Notas:

- No guardes credenciales SMTP de Resend en `.env.local` de esta app salvo que luego implementemos un mailer propio.
- El codigo actual ya usa Supabase Auth para `signUp` e invitaciones admin, asi que no necesita cambios para que el SMTP funcione.

## Estructura de documentacion

- [docs/README.md](docs/README.md): indice general
- [docs/setup/GETTING_STARTED.md](docs/setup/GETTING_STARTED.md): setup base
- [docs/setup/SECURITY_IMPROVEMENTS.md](docs/setup/SECURITY_IMPROVEMENTS.md): reglas y decisiones de seguridad
- [docs/testing/TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md): como probar
- [docs/product/MEJORAS_PRIORITARIAS.md](docs/product/MEJORAS_PRIORITARIAS.md): backlog priorizado

## Seguridad

- RLS como control principal de acceso a datos
- Claves sensibles solo en servidor
- Validacion de formularios en cliente y servidor
- Restricciones de upload por tipo, tamano y ownership

## Notas

- `docs/archive/` contiene material historico y ya no es la fuente principal.
- Si corres Playwright y crea datos de prueba, limpialos al finalizar.
