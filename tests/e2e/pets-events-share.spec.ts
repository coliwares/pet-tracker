import { expect, test } from '@playwright/test';
import { loginAsDemo } from '../helpers/auth';
import {
  createEvent,
  createPet,
  createPetWithDetails,
  deleteCurrentPet,
  extractSharedUrlFromQr,
  uniqueName,
} from '../helpers/pets';

test.describe('Mascotas, eventos y enlace compartido', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('permite crear una mascota y mostrar su carnet', async ({ page }) => {
    const petName = uniqueName('PlaywrightPet');
    let petId = '';

    try {
      petId = await createPet(page, petName);

      await expect(
        page.getByRole('heading', { name: new RegExp(petName, 'i') })
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/qr listo/i).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/historial m[eÃ©]dico/i).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('share-url-input')).toHaveValue(/\/share\//);
    } finally {
      if (petId) {
        await page.goto(`/dashboard/${petId}`);
      }
      await deleteCurrentPet(page);
    }
  });

  test('muestra eventos atrasados cuando existe al menos un recordatorio vencido', async ({ page }) => {
    const petName = uniqueName('PetAtrasada');
    let petId = '';

    try {
      petId = await createPet(page, petName);
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
    } finally {
      if (petId) {
        await page.goto(`/dashboard/${petId}`);
      }
      await deleteCurrentPet(page);
    }
  });

  test('permite editar una mascota y refleja los cambios en la ficha', async ({ page }) => {
    const petName = uniqueName('PetEditable');
    let petId = '';
    const updatedBreed = `Labrador ${Date.now()}`;
    const updatedWeight = '18.2';
    const updatedNotes = 'Actualizado por testing E2E';

    try {
      petId = await createPet(page, petName);

      await page.getByRole('link', { name: /editar ficha/i }).click();
      await expect(
        page.getByRole('heading', { name: new RegExp(`editar informaci[oÃ³]n de ${petName}`, 'i') })
      ).toBeVisible();

      await page.getByPlaceholder(/labrador, persa/i).fill(updatedBreed);
      await page.getByPlaceholder(/5\.5, 12\.3, 30\.0/i).fill(updatedWeight);
      await page.getByPlaceholder(/alergias, condiciones especiales/i).fill(updatedNotes);
      await page.getByRole('button', { name: /guardar cambios/i }).click();

      await expect(page.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(updatedBreed)).toBeVisible();
      await expect(page.getByText(new RegExp(`${updatedWeight} kg`))).toBeVisible();
      await expect(page.getByText(updatedNotes)).toBeVisible();
    } finally {
      if (petId) {
        await page.goto(`/dashboard/${petId}`);
      }
      await deleteCurrentPet(page);
    }
  });

  test('permite filtrar mascotas por nombre y especie desde el dashboard', async ({ page }) => {
    const dogName = uniqueName('FiltroPerro');
    const catName = uniqueName('FiltroGato');
    let dogPetId = '';
    let catPetId = '';

    try {
      dogPetId = await createPetWithDetails(page, { name: dogName, species: 'Perro', breed: 'Quiltro' });
      await page.goto('/dashboard');

      catPetId = await createPetWithDetails(page, { name: catName, species: 'Gato', breed: 'Europeo' });
      await page.goto('/dashboard');

      await page.getByPlaceholder(/busca por nombre/i).fill(catName);
      await expect(page.getByText(/^1 resultado$/i)).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(catName, 'i') })).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(dogName, 'i') })).toHaveCount(0);

      await page.getByRole('button', { name: /limpiar filtros/i }).click();
      await page.locator('select').first().selectOption('Gato');
      await expect(page.getByRole('heading', { name: new RegExp(catName, 'i') })).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(dogName, 'i') })).toHaveCount(0);
    } finally {
      if (catPetId) {
        await page.goto(`/dashboard/${catPetId}`);
        await deleteCurrentPet(page);
      }
      if (dogPetId) {
        await page.goto(`/dashboard/${dogPetId}`);
        await deleteCurrentPet(page);
      }
    }
  });

  test('no muestra onboarding de primeros pasos a un usuario con historial existente', async ({ page }) => {
    const petName = uniqueName('OnboardingExperto');
    let petId = '';

    try {
      petId = await createPet(page, petName);

      await expect(page.getByText(/ahora registra el primer evento/i)).toHaveCount(0);
      await expect(page.getByText(/primer evento guardado/i)).toHaveCount(0);
    } finally {
      if (petId) {
        await page.goto(`/dashboard/${petId}`);
      }
      await deleteCurrentPet(page);
    }
  });

  test('genera un enlace publico reutilizable mientras siga vigente', async ({ page, context }) => {
    const petName = uniqueName('PetShare');
    let petId = '';

    try {
      petId = await createPet(page, petName);

      const firstShareUrl = await extractSharedUrlFromQr(page);
      await expect(page.getByText(/expira el/i)).toBeVisible();

      await page.reload();
      await expect(page.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible();

      const secondShareUrl = await extractSharedUrlFromQr(page);
      await expect.poll(() => secondShareUrl.startsWith('http://localhost:3000/share/')).toBe(true);

      const sharedPage = await context.newPage();
      await sharedPage.goto(secondShareUrl);

      await expect(sharedPage.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible();
      await expect(sharedPage.getByText(/carnet compartido/i)).toBeVisible();
      await expect(sharedPage.getByText(/p[uÃº]blico y de solo lectura/i)).toBeVisible();
      await expect(sharedPage.getByRole('link', { name: /editar ficha/i })).toHaveCount(0);
      await expect(sharedPage.getByRole('button', { name: /agregar evento/i })).toHaveCount(0);
      await sharedPage.close();
    } finally {
      if (petId) {
        await page.goto(`/dashboard/${petId}`);
      }
      await deleteCurrentPet(page);
    }
  });
});
