# 🧪 PLAN DE TESTING AUTOMATIZADO - Pet Tracker

**Objetivo:** Automatizar 56 casos de prueba manuales + nuevas funcionalidades  
**Framework:** Playwright  
**Timeline:** 6-8 horas implementación + maintenance  
**ROI:** Evitar regresiones, refactor con confianza

---

## SETUP INICIAL

### 1. Instalar Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install

# O instalar solo Chrome (más rápido)
npx playwright install chromium
```

### 2. Crear Estructura

```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── pets.spec.ts
│   ├── events.spec.ts
│   ├── landing.spec.ts
│   └── notifications.spec.ts
├── fixtures/
│   └── auth.ts
└── helpers/
    └── db.ts
```

### 3. Configurar `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### 4. En `package.json` agregar scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed"
  }
}
```

---

## TEST SUITE 1: AUTENTICACIÓN

### Archivo: `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

// Fixture para auth
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

test.describe('Autenticación', () => {
  test('debe cargar landing correctamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar header
    await expect(page.locator('text=Pet Carnet')).toBeVisible();
    
    // Verificar hero section
    await expect(
      page.locator('text=Toda la salud de tu mascota en un lugar')
    ).toBeVisible();
    
    // Verificar CTAs
    await expect(page.locator('button:has-text("Empezar Gratis")')).toBeVisible();
    await expect(page.locator('button:has-text("Ver Demo")')).toBeVisible();
  });

  test('debe registrar nuevo usuario correctamente', async ({ page }) => {
    await page.goto('/signup');
    
    // Llenar formulario
    await page.fill('[name=email]', testUser.email);
    await page.fill('[name=password]', testUser.password);
    await page.fill('[name=confirmPassword]', testUser.password);
    
    // Aceptar términos
    await page.check('[name=terms]');
    
    // Submit
    await page.click('button:has-text("Registrarse")');
    
    // Verificar redirección a dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1:has-text("Mis Mascotas")')).toBeVisible();
  });

  test('debe rechazar contraseña muy corta', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', '123'); // Muy corta
    await page.fill('[name=confirmPassword]', '123');
    await page.check('[name=terms]');
    
    // Debe mostrar error
    await expect(page.locator('text=mínimo 6 caracteres')).toBeVisible();
    
    // Botón debe estar deshabilitado
    await expect(page.locator('button:has-text("Registrarse")')).toBeDisabled();
  });

  test('debe rechazar email inválido', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name=email]', 'invalidemail');
    await page.fill('[name=password]', testUser.password);
    
    // Debe mostrar error
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('debe hacer login con credenciales correctas', async ({ page }) => {
    // Primero registrar
    await page.goto('/signup');
    await page.fill('[name=email]', testUser.email);
    await page.fill('[name=password]', testUser.password);
    await page.fill('[name=confirmPassword]', testUser.password);
    await page.check('[name=terms]');
    await page.click('button:has-text("Registrarse")');
    await page.waitForURL('/dashboard');
    
    // Logout
    await page.click('button:has-text("Salir")');
    await expect(page).toHaveURL('/login');
    
    // Login
    await page.fill('[name=email]', testUser.email);
    await page.fill('[name=password]', testUser.password);
    await page.click('button:has-text("Ingresar")');
    
    // Debe regresar a dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe rechazar password incorrecto', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name=email]', testUser.email);
    await page.fill('[name=password]', 'WrongPassword123!');
    await page.click('button:has-text("Ingresar")');
    
    // Debe mostrar error
    await expect(page.locator('text=Email o contraseña incorrectos')).toBeVisible();
  });

  test('debe persistir sesión después de reload', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', testUser.email);
    await page.fill('[name=password]', testUser.password);
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL('/dashboard');
    
    // Reload
    await page.reload();
    
    // Debe seguir en dashboard (sesión persistida)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1:has-text("Mis Mascotas")')).toBeVisible();
  });

  test('debe redirigir a login si accede /dashboard sin auth', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Debe redirigir a /login
    await expect(page).toHaveURL('/login');
  });

  test('debe proteger contra rate limiting en signup', async ({ page }) => {
    // Intentar registrar 3+ veces rápido
    const emails = [
      `test1-${Date.now()}@example.com`,
      `test2-${Date.now()}@example.com`,
      `test3-${Date.now()}@example.com`,
      `test4-${Date.now()}@example.com`,
    ];

    for (const email of emails.slice(0, 3)) {
      await page.goto('/signup');
      await page.fill('[name=email]', email);
      await page.fill('[name=password]', 'Password123!');
      await page.fill('[name=confirmPassword]', 'Password123!');
      await page.check('[name=terms]');
      await page.click('button:has-text("Registrarse")');
      await page.waitForTimeout(100);
    }

    // Cuarto intento debe estar bloqueado
    await page.goto('/signup');
    await page.fill('[name=email]', emails[3]);
    await page.fill('[name=password]', 'Password123!');
    await page.fill('[name=confirmPassword]', 'Password123!');
    await page.check('[name=terms]');
    await page.click('button:has-text("Registrarse")');

    // Debe mostrar error de rate limit
    await expect(page.locator('text=Demasiados intentos')).toBeVisible();
  });
});
```

---

## TEST SUITE 2: MASCOTAS (CRUD)

### Archivo: `tests/e2e/pets.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gestión de Mascotas', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    await page.fill('[name=email]', 'test@pettrack.cl');
    await page.fill('[name=password]', 'pettrack');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL('/dashboard');
  });

  test('debe crear mascota correctamente', async ({ page }) => {
    // Click en "Nueva Mascota"
    await page.click('button:has-text("Nueva Mascota")');
    await expect(page).toHaveURL(/\/dashboard\/new-pet/);

    // Llenar form
    await page.fill('[name=name]', 'Max');
    await page.selectOption('[name=species]', 'dog');
    await page.fill('[name=breed]', 'Golden Retriever');
    await page.fill('[name=birthDate]', '2019-04-15');
    await page.fill('[name=weight]', '30');
    await page.fill('[name=notes]', 'Alérgico al pollo');

    // Submit
    await page.click('button:has-text("Crear mascota")');

    // Debe volver a dashboard y mostrar la mascota
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Max')).toBeVisible();
    await expect(page.locator('text=Golden Retriever')).toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    await page.click('button:has-text("Nueva Mascota")');

    // Intentar submit sin llenar
    await page.click('button:has-text("Crear mascota")');

    // Debe mostrar errores
    await expect(page.locator('text=Campo requerido')).toBeVisible();
  });

  test('debe calcular edad automáticamente', async ({ page }) => {
    await page.click('button:has-text("Nueva Mascota")');

    await page.fill('[name=name]', 'Luna');
    await page.selectOption('[name=species]', 'cat');
    await page.fill('[name=breed]', 'Siamesa');
    await page.fill('[name=birthDate]', '2022-04-15'); // hace ~2 años
    await page.fill('[name=weight]', '4.5');

    await page.click('button:has-text("Crear mascota")');
    await expect(page).toHaveURL('/dashboard');

    // Click en la mascota
    await page.click('text=Luna');

    // Verificar que muestra la edad calculada
    const ageText = page.locator('text=/\\d+ años?/');
    await expect(ageText).toBeVisible();
  });

  test('debe editar mascota', async ({ page }) => {
    // Crear mascota primero
    await page.click('button:has-text("Nueva Mascota")');
    await page.fill('[name=name]', 'Bingo');
    await page.selectOption('[name=species]', 'dog');
    await page.fill('[name=breed]', 'Caniche');
    await page.fill('[name=birthDate]', '2020-01-01');
    await page.fill('[name=weight]', '15');
    await page.click('button:has-text("Crear mascota")');

    // Click en mascota para entrar
    await page.click('text=Bingo');

    // Click en editar
    await page.click('button:has-text("Editar")');
    await expect(page).toHaveURL(/\/dashboard\/.*\/edit/);

    // Modificar peso
    await page.fill('[name=weight]', '16');

    // Submit
    await page.click('button:has-text("Guardar cambios")');

    // Verificar que se actualizó
    await expect(page.locator('text=16 kg')).toBeVisible();
  });

  test('debe eliminar mascota con confirmación', async ({ page }) => {
    // Crear mascota
    await page.click('button:has-text("Nueva Mascota")');
    await page.fill('[name=name]', 'Temporal');
    await page.selectOption('[name=species]', 'dog');
    await page.fill('[name=breed]', 'Mixto');
    await page.fill('[name=birthDate]', '2020-01-01');
    await page.fill('[name=weight]', '20');
    await page.click('button:has-text("Crear mascota")');

    // Entrar a mascota
    await page.click('text=Temporal');

    // Click eliminar
    await page.click('button:has-text("Eliminar mascota")');

    // Modal debe aparecer
    await expect(page.locator('text=¿Estás seguro?')).toBeVisible();

    // Cancelar
    await page.click('button:has-text("Cancelar")');
    await expect(page.locator('text=Temporal')).toBeVisible();

    // Eliminar de verdad
    await page.click('button:has-text("Eliminar mascota")');
    await page.click('button:has-text("Confirmar eliminación")');

    // Debe volver a dashboard sin la mascota
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Temporal')).not.toBeVisible();
  });

  test('responsive en mobile', async ({ page }) => {
    // Simular mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Debe mostrar lista de mascotas
    await expect(page.locator('h1:has-text("Mis Mascotas")')).toBeVisible();

    // Crear mascota en mobile
    await page.click('button:has-text("Nueva Mascota")');
    await expect(page).toHaveURL(/\/dashboard\/new-pet/);

    // Form debe ser responsive
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
  });
});
```

---

## TEST SUITE 3: EVENTOS MÉDICOS

### Archivo: `tests/e2e/events.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gestión de Eventos Médicos', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', 'test@pettrack.cl');
    await page.fill('[name=password]', 'pettrack');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL('/dashboard');

    // Crear mascota de prueba
    await page.click('button:has-text("Nueva Mascota")');
    await page.fill('[name=name]', 'TestPet');
    await page.selectOption('[name=species]', 'dog');
    await page.fill('[name=breed]', 'Mixto');
    await page.fill('[name=birthDate]', '2020-01-01');
    await page.fill('[name=weight]', '20');
    await page.click('button:has-text("Crear mascota")');

    // Entrar a mascota
    await page.click('text=TestPet');
  });

  test('debe crear evento médico', async ({ page }) => {
    // Click agregar evento
    await page.click('button:has-text("Agregar evento")');
    await expect(page.locator('text=Nuevo evento médico')).toBeVisible();

    // Llenar formulario
    await page.selectOption('[name=type]', 'vaccine');
    await page.fill('[name=title]', 'Vacuna Rabia');
    await page.fill('[name=description]', 'Dosis completa');
    await page.fill('[name=date]', '2026-04-15');
    await page.check('[name=hasNextDose]');
    await page.fill('[name=nextDoseDate]', '2027-04-15');

    // Submit
    await page.click('button:has-text("Crear evento")');

    // Debe aparecer en timeline
    await expect(page.locator('text=Vacuna Rabia')).toBeVisible();
    await expect(page.locator('text=Próxima dosis: 15 abr 2027')).toBeVisible();
  });

  test('debe mostrar eventos en timeline ordenados', async ({ page }) => {
    // Crear múltiples eventos
    const events = [
      { title: 'Evento 1', date: '2026-01-01' },
      { title: 'Evento 2', date: '2026-03-01' },
      { title: 'Evento 3', date: '2026-02-01' },
    ];

    for (const event of events) {
      await page.click('button:has-text("Agregar evento")');
      await page.selectOption('[name=type]', 'visit');
      await page.fill('[name=title]', event.title);
      await page.fill('[name=date]', event.date);
      await page.click('button:has-text("Crear evento")');
      await page.waitForTimeout(500);
    }

    // Verificar orden (DESC: más reciente primero)
    const timeline = page.locator('.timeline-item');
    const firstEvent = timeline.first();

    // Primer evento debe ser el más reciente
    await expect(firstEvent).toContainText('Evento 2');
  });

  test('debe editar evento', async ({ page }) => {
    // Crear evento
    await page.click('button:has-text("Agregar evento")');
    await page.selectOption('[name=type]', 'medicine');
    await page.fill('[name=title]', 'Antibiótico');
    await page.fill('[name=date]', '2026-04-15');
    await page.click('button:has-text("Crear evento")');

    // Click en evento para editarlo
    await page.click('text=Antibiótico');
    await page.click('button:has-text("Editar")');

    // Modificar
    await page.fill('[name=title]', 'Antibiótico (dosis alta)');
    await page.click('button:has-text("Guardar cambios")');

    // Verificar cambio
    await expect(page.locator('text=Antibiótico (dosis alta)')).toBeVisible();
  });

  test('debe eliminar evento', async ({ page }) => {
    // Crear evento
    await page.click('button:has-text("Agregar evento")');
    await page.selectOption('[name=type]', 'other');
    await page.fill('[name=title]', 'Evento a eliminar');
    await page.fill('[name=date]', '2026-04-15');
    await page.click('button:has-text("Crear evento")');

    // Click para eliminar
    await page.click('text=Evento a eliminar');
    await page.click('button:has-text("Eliminar")');

    // Confirmar
    await page.click('button:has-text("Confirmar")');

    // No debe existir
    await expect(page.locator('text=Evento a eliminar')).not.toBeVisible();
  });

  test('debe colorear eventos por tipo', async ({ page }) => {
    // Crear evento de cada tipo
    const types = ['vaccine', 'visit', 'medicine', 'other'];

    for (const type of types) {
      await page.click('button:has-text("Agregar evento")');
      await page.selectOption('[name=type]', type);
      await page.fill('[name=title]', `Evento ${type}`);
      await page.fill('[name=date]', '2026-04-15');
      await page.click('button:has-text("Crear evento")');
      await page.waitForTimeout(300);
    }

    // Verificar colores (mediante clases)
    const vaccineEvent = page.locator('text=Evento vaccine').first();
    await expect(vaccineEvent).toHaveClass(/bg-blue/);

    const visitEvent = page.locator('text=Evento visit').first();
    await expect(visitEvent).toHaveClass(/bg-green/);
  });
});
```

---

## TEST SUITE 4: LANDING PAGE MEJORADA

### Archivo: `tests/e2e/landing.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page Mejorada', () => {
  test('debe mostrar hero section completo', async ({ page }) => {
    await page.goto('/');

    // Hero title
    await expect(
      page.locator('text=Toda la salud de tu mascota en un lugar')
    ).toBeVisible();

    // Hero subtitle
    await expect(
      page.locator('text=Gestiona historial médico, vacunas')
    ).toBeVisible();

    // CTAs principales
    await expect(page.locator('button:has-text("Empezar Gratis")')).toBeVisible();
    await expect(page.locator('button:has-text("Ver Demo")')).toBeVisible();
  });

  test('debe mostrar features grid', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));

    // Verificar features
    await expect(page.locator('text=Historial Ordenado')).toBeVisible();
    await expect(
      page.locator('text=Recordatorios Automáticos')
    ).toBeVisible();
    await expect(page.locator('text=100% Privado')).toBeVisible();
    await expect(page.locator('text=Comparte con tu Vet')).toBeVisible();
  });

  test('debe mostrar testimonios', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));

    // Verificar testimonios
    await expect(
      page.locator('text=/Finalmente tengo el historial/')
    ).toBeVisible();
    await expect(page.locator('text=María P')).toBeVisible();
  });

  test('CTA debe llevar a signup', async ({ page }) => {
    await page.goto('/');

    // Click en "Empezar Gratis"
    await page.click('button:has-text("Empezar Gratis")');

    // Debe ir a /signup
    await expect(page).toHaveURL('/signup');
  });

  test('debe ser responsive en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Hero debe ser visible
    await expect(
      page.locator('text=Toda la salud de tu mascota')
    ).toBeVisible();

    // CTA debe ser tapeable (grande)
    const button = page.locator('button:has-text("Empezar Gratis")');
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThan(44); // min 44px height
  });

  test('navegación sticky debe funcionar', async ({ page }) => {
    await page.goto('/');

    // Scroll
    await page.evaluate(() => window.scrollBy(0, 500));

    // Nav debe seguir visible
    await expect(page.locator('text=Pet Carnet')).toBeVisible();

    // Botones de login/signup disponibles
    await expect(page.locator('button:has-text("Ingresar")')).toBeVisible();
    await expect(page.locator('button:has-text("Registrarse")')).toBeVisible();
  });
});
```

---

## TEST SUITE 5: NOTIFICACIONES DE VACUNAS

### Archivo: `tests/e2e/notifications.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Notificaciones de Próximas Vacunas', () => {
  test('debe mostrar alerta si hay vacunas en próximos 7 días', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'test@pettrack.cl');
    await page.fill('[name=password]', 'pettrack');
    await page.click('button:has-text("Ingresar")');

    // Crear mascota
    await page.click('button:has-text("Nueva Mascota")');
    await page.fill('[name=name]', 'Bingo');
    await page.selectOption('[name=species]', 'dog');
    await page.fill('[name=breed]', 'Caniche');
    await page.fill('[name=birthDate]', '2020-01-01');
    await page.fill('[name=weight]', '15');
    await page.click('button:has-text("Crear mascota")');

    // Entrar a mascota y crear evento de vacuna en 5 días
    await page.click('text=Bingo');
    await page.click('button:has-text("Agregar evento")');
    await page.selectOption('[name=type]', 'vaccine');
    await page.fill('[name=title]', 'Rabia');

    // Fecha 5 días desde hoy
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];
    await page.fill('[name=date]', dateStr);

    await page.check('[name=hasNextDose]');
    await page.fill('[name=nextDoseDate]', dateStr);
    await page.click('button:has-text("Crear evento")');

    // Volver a dashboard
    await page.click('text=Mis Mascotas');

    // Debe aparecer alerta de próximas vacunas
    await expect(
      page.locator('text=Próximas vacunas en los próximos 7 días')
    ).toBeVisible();
    await expect(page.locator('text=Bingo')).toBeVisible();
    await expect(page.locator('text=Rabia')).toBeVisible();
  });

  test('no debe mostrar alerta si no hay vacunas próximas', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'test@pettrack.cl');
    await page.fill('[name=password]', 'pettrack');
    await page.click('button:has-text("Ingresar")');

    // Si no hay eventos, alerta no debe aparecer
    const alert = page.locator('text=Próximas vacunas');
    await expect(alert).not.toBeVisible();
  });

  test('click en "Ver" debe llevar a mascota', async ({ page }) => {
    // Setup: crear mascota con vacuna próxima
    // (similar al test anterior)
    // ...

    // Click en "Ver"
    await page.click('a:has-text("Ver")');

    // Debe ir a detalle de mascota
    await expect(page).toHaveURL(/\/dashboard\/[a-f0-9-]+$/);
  });
});
```

---

## 🚀 EJECUTAR TESTS

### Desarrollo (sin headless)
```bash
npm run test:headed
```

### UI interactivo
```bash
npm run test:ui
```

### Debug (paso a paso)
```bash
npm run test:debug
```

### CI/CD (GitHub Actions)
```bash
npm test
```

---

## 📊 COVERAGE ESPERADO

| Suite | Tests | Cobertura | Status |
|-------|-------|-----------|--------|
| Auth | 9 | 95% | ✅ Critical |
| Pets | 6 | 90% | ✅ Critical |
| Events | 5 | 85% | ✅ Critical |
| Landing | 5 | 80% | ✅ Important |
| Notifications | 3 | 85% | ✅ Important |
| **Total** | **28** | **87%** | ✅ Good |

---

## ⚡ TIPS & TRICKS

### 1. Usar Data Attributes
```typescript
// En componente
<button data-testid="create-pet-btn">Nueva Mascota</button>

// En test
await page.click('[data-testid="create-pet-btn"]');
```

### 2. Screenshots de Fallos
```typescript
test('algo importante', async ({ page }) => {
  // ...
  // Si falla, automáticamente toma screenshot
});
```

### 3. Video de Tests
```typescript
// En playwright.config.ts
video: 'retain-on-failure' // Solo si falla
```

### 4. Esperar Correctamente
```typescript
// ❌ Evitar
await page.waitForTimeout(1000);

// ✅ Correcto
await page.waitForURL('/dashboard');
await expect(element).toBeVisible();
```

---

## 📋 CHECKLIST

- [ ] Instalar Playwright
- [ ] Crear `playwright.config.ts`
- [ ] Crear estructura de carpetas `tests/`
- [ ] Implementar test suite 1-5
- [ ] Ejecutar localmente
- [ ] Agregar a GitHub Actions
- [ ] Ejecutar en CI/CD
- [ ] Coverage report
- [ ] Documentar en README

---

## PRÓXIMOS PASOS

1. **Esta semana:** Implementar tests de auth + pets
2. **Próxima semana:** Agregar tests de eventos + landing
3. **Permanentemente:** Escribir tests para cada nueva feature

---

Ahora tienes un plan de testing automatizado que evitará regresiones
y te dará confianza al refactorear. 💪
