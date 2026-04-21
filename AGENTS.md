# AGENTS.md

## Proyecto
Pet Tracker es una app web en Next.js 16 + React 19 + TypeScript, desplegada en Vercel, con Auth/DB/Storage en Supabase.

## Objetivo del agente
Priorizar:
1. Seguridad
2. Correctitud funcional
3. UX mobile-first
4. Simplicidad de mantenimiento
5. Performance razonable

## Reglas técnicas
- No introducir nuevas librerías sin justificarlo.
- Preferir Server Components y server-side boundaries cuando aplique.
- No exponer secrets ni mover claves al cliente.
- Nunca usar service role key en código cliente.
- Mantener compatibilidad con Vercel.
- Mantener RLS como control principal de acceso a datos.
- Si se toca auth, seguir el enfoque actual recomendado por Supabase SSR.
- Si se toca uploads, validar tamaño, tipo y ownership del archivo.
- Si se toca formularios, agregar validación cliente + servidor.

## Reglas de trabajo
- Antes de editar, explicar qué archivos tocarás.
- Después de editar, ejecutar:
  1. npm run type-check
  2. npm run lint
  3. npm run test
- Si falla algo, priorizar arreglar la causa raíz.
- No cambiar migraciones existentes sin explicar impacto.
- No modificar variables de entorno ni credenciales reales.
- Para cambios grandes, proponer plan corto antes de editar.
- una vez ejecutados los test correctamente elimina los datos creados.

## QA esperado
- Para bugs: incluir reproducción, causa probable y fix.
- Para features: incluir happy path + edge cases + riesgo de regresión.
- Para auth: validar login, signup, logout, sesión persistente y rutas protegidas.
- Para CRUD: validar permisos RLS, ownership y cascadas.