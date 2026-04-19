import { expect, Page } from '@playwright/test';

const demoEmail = process.env.PLAYWRIGHT_DEMO_EMAIL ?? 'test@pettrack.cl';
const demoPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD ?? 'pettrack';

export async function loginAsDemo(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(demoEmail);
  await page.locator('input[type="password"]').fill(demoPassword);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /salir/i }).click();
  await expect(page).toHaveURL('/');
}
