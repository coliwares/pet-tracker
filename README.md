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
