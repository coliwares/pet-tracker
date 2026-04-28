# Pet Tracker

Aplicación web para gestionar mascotas, eventos médicos y enlaces compartidos de lectura.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + Postgres + Storage
- Tailwind CSS v4
- Vitest + Playwright para testing

## Estado actual

- Autenticación con Supabase
- Dashboard de mascotas
- CRUD de mascotas y eventos
- Perfil del tutor
- Enlaces compartidos de solo lectura
- Feedback de usuarios y panel admin
- Upload de imágenes con validaciones

## Inicio rápido

Usa este archivo como resumen operativo. El detalle de setup, testing y producto vive en [docs/README.md](docs/README.md).

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

## Comandos útiles

```bash
npm run dev
npm run type-check
npm run lint
npm run test
```

## Documentación

- [docs/README.md](docs/README.md): índice general y fuente de verdad
- [docs/setup/GETTING_STARTED.md](docs/setup/GETTING_STARTED.md): setup completo y SMTP con Resend
- [docs/setup/SECURITY_IMPROVEMENTS.md](docs/setup/SECURITY_IMPROVEMENTS.md): decisiones de seguridad
- [docs/testing/TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md): flujo de validación
- [docs/product/MEJORAS_PRIORITARIAS.md](docs/product/MEJORAS_PRIORITARIAS.md): backlog priorizado

## Seguridad

- RLS como control principal de acceso a datos
- Claves sensibles solo en servidor
- Validación de formularios en cliente y servidor
- Restricciones de upload por tipo, tamaño y ownership

## Notas

- `docs/archive/` contiene material histórico y ya no es la fuente principal.
- Si corres Playwright y crea datos de prueba, límpialos al finalizar.
