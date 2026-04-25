# Seguridad

## Principios del proyecto

- RLS como control principal de acceso
- Secrets solo en servidor
- Validacion cliente y servidor
- Uploads con ownership, tamano y tipo validados
- Mantener compatibilidad con Supabase SSR y Vercel

## Checklist operativo

- `SUPABASE_SERVICE_ROLE_KEY` nunca en cliente
- Rutas sensibles protegidas por sesion
- APIs con validacion de payload
- Formularios con mensajes de error claros
- Storage limitado a archivos esperados

## Autenticacion

- Supabase Auth como proveedor principal
- Sesion consultada desde server boundaries cuando aplica
- Logout a traves de ruta del servidor

## Base de datos

- Policies por usuario en `pets`, `events`, `feedback` y `tutor_profiles`
- Relaciones con `on delete cascade` donde corresponde
- Sin accesos globales desde cliente

## Storage

- Bucket `pet-photos`
- Validacion de MIME y tamano
- Carpeta por usuario para preservar ownership

## Riesgos a revisar antes de mergear cambios sensibles

- Auth
- Uploads
- APIs administrativas
- Nuevas tablas o policies

## Fuente de verdad

Los scripts SQL de `supabase/` mandan sobre esta guia.
