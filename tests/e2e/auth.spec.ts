import { expect, test } from '@playwright/test';
import { loginAsDemo, logout } from '../helpers/auth';

test.describe('Autenticacion', () => {
  test('protege dashboard para usuarios no autenticados', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('permite ingresar con la cuenta demo y cerrar sesion al home', async ({ page }) => {
    await loginAsDemo(page);

    await expect(page.getByRole('heading', { name: /mis mascotas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /salir/i })).toBeVisible();

    await logout(page);
    await expect(
      page.getByRole('heading', { name: /toda la salud de tu mascota en un solo lugar/i })
    ).toBeVisible();
  });

  test('muestra error con credenciales invalidas', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@pettrack.cl');
    await page.locator('input[type="password"]').fill('credencial-invalida');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.getByText(/error|invalido|incorrect/i)).toBeVisible();
  });
});
