# Testing Guide

## Objetivo

Validar cambios sin perder cobertura basica de auth, mascotas, eventos y vistas compartidas.

## Flujo recomendado

1. `npm run type-check`
2. `npm run lint`
3. `npm run test:unit`
4. `npm run test`

## Suite automatizada

- Configuracion en `playwright.config.ts`
- Specs en `tests/e2e/`
- Helpers en `tests/helpers/`
- Unit tests en `tests/unit/`
- Runner unitario en `vitest.config.ts`

## Credenciales demo

Por defecto:

```env
PLAYWRIGHT_DEMO_EMAIL=test@pettrack.cl
PLAYWRIGHT_DEMO_PASSWORD=pettrack
```

Puedes overridearlas con variables de entorno.

## Casos que siempre conviene revisar

- Login y logout
- Dashboard protegido
- Crear mascota
- Crear evento
- Compartir carnet
- Perfil del tutor si fue tocado

## Si la suite crea datos

Limpiar mascotas o eventos de prueba al finalizar.

## Si falla Playwright

- Revisar `test-results/`
- Revisar screenshot, trace y `error-context.md`
- Confirmar si el fallo es real o inestabilidad previa
