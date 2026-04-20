import { expect, test } from '@playwright/test';
import { loginAsDemo } from '../helpers/auth';
import { createEvent, createPet, extractSharedUrlFromQr, uniqueName } from '../helpers/pets';

test.describe('Mascotas, eventos y enlace compartido', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('permite crear una mascota y mostrar su carnet', async ({ page }) => {
    const petName = uniqueName('PlaywrightPet');

    await createPet(page, petName);

    await expect(
      page.getByRole('heading', { name: new RegExp(petName, 'i') })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/qr listo/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/historial medico/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('muestra eventos atrasados cuando existe al menos un recordatorio vencido', async ({ page }) => {
    const petName = uniqueName('PetAtrasada');

    await createPet(page, petName);
    await createEvent(page, {
      type: 'visita',
      title: 'Control anual',
      eventDate: '2026-04-01',
      nextDueDate: '2026-04-02',
    });

    await expect(page.getByText(/eventos atrasados/i).first()).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/evento atrasado|eventos atrasados/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('genera un enlace publico reutilizable mientras siga vigente', async ({ page, context }) => {
    const petName = uniqueName('PetShare');

    await createPet(page, petName);

    const firstShareUrl = await extractSharedUrlFromQr(page);
    await expect(page.getByText(/expira el/i)).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible();

    const secondShareUrl = await extractSharedUrlFromQr(page);
    expect(secondShareUrl).toBe(firstShareUrl);

    const sharedPage = await context.newPage();
    await sharedPage.goto(firstShareUrl);

    await expect(sharedPage.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible();
    await expect(sharedPage.getByText(/carnet compartido/i)).toBeVisible();
    await expect(sharedPage.getByText(/publico y de solo lectura/i)).toBeVisible();
  });
});
