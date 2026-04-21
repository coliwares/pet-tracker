import { expect, test } from '@playwright/test';

test.describe('Landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('muestra la propuesta de valor y los CTAs principales', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /toda la salud de tu mascota en un solo lugar/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /probar demo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^ingresar$/i })).toBeVisible();
    await expect(page.getByText(/registro temporalmente cerrado/i)).toBeVisible();
  });

  test('el CTA de demo lleva a login con credenciales precargadas', async ({ page }) => {
    await page.goto('/');
    await Promise.all([
      page.waitForURL(/\/login\?demo=true$/, { timeout: 15000 }),
      page.getByRole('link', { name: /probar demo/i }).click(),
    ]);

    await expect(page.getByText(/cuenta demo precargada/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveValue(/test@pettrack\.cl/i);
  });

  test('signup informa que el registro esta temporalmente cerrado y permite pedir acceso', async ({ page }) => {
    await page.goto('/signup');

    await expect(
      page.getByRole('heading', { name: /registro temporalmente cerrado/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /solicitar acceso beta/i })).toBeEnabled();
  });
});
