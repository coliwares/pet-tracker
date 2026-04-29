import { expect, Page } from '@playwright/test';

export function uniqueName(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function fieldInputAfterLabel(page: Page, labelText: RegExp | string) {
  return page
    .locator('label')
    .filter({ hasText: labelText })
    .locator('xpath=following-sibling::*[1][self::input or self::textarea or self::select]');
}

export async function createPet(page: Page, petName: string) {
  await Promise.all([
    page.waitForURL(/\/dashboard\/new-pet$/, { timeout: 15000 }),
    page.getByRole('link', { name: /agregar mascota|nueva mascota/i }).click(),
  ]);

  await fieldInputAfterLabel(page, /nombre/i).fill(petName);
  await page.locator('select').first().selectOption('Perro');
  await fieldInputAfterLabel(page, /raza/i).fill('Mestizo');
  await fieldInputAfterLabel(page, /fecha de nacimiento/i).fill('2020-01-15');
  await fieldInputAfterLabel(page, /peso/i).fill('15.5');
  await page.locator('textarea').first().fill('Creado por testing automatico');
  await page.getByRole('button', { name: /crear mascota/i }).click();

  await page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 });
}

export async function createPetWithDetails(
  page: Page,
  options: {
    name: string;
    species?: 'Perro' | 'Gato' | 'Ave' | 'Conejo' | 'Hamster' | 'Reptil' | 'Otro';
    breed?: string;
    birthDate?: string;
    weight?: string;
    notes?: string;
  }
) {
  const {
    name,
    species = 'Perro',
    breed = 'Mestizo',
    birthDate = '2020-01-15',
    weight = '15.5',
    notes = 'Creado por testing automatico',
  } = options;

  await Promise.all([
    page.waitForURL(/\/dashboard\/new-pet$/, { timeout: 15000 }),
    page.getByRole('link', { name: /agregar mascota|nueva mascota/i }).click(),
  ]);

  await fieldInputAfterLabel(page, /nombre/i).fill(name);
  await page.locator('select').first().selectOption(species);
  await fieldInputAfterLabel(page, /raza/i).fill(breed);
  await fieldInputAfterLabel(page, /fecha de nacimiento/i).fill(birthDate);
  await fieldInputAfterLabel(page, /peso/i).fill(weight);
  await page.locator('textarea').first().fill(notes);
  await page.getByRole('button', { name: /crear mascota/i }).click();

  await page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 });
}

export async function createEvent(
  page: Page,
  options: {
    type?: 'vacuna' | 'visita' | 'medicina' | 'otro';
    title?: string;
    description?: string;
    eventDate?: string;
    nextDueDate?: string;
    notes?: string;
  }
) {
  const {
    type = 'visita',
    title = 'Control anual',
    description,
    eventDate = '2026-04-10',
    nextDueDate,
    notes,
  } = options;

  await page.getByRole('link', { name: /agregar evento/i }).first().click();
  await expect(page).toHaveURL(/\/events\/new$/);

  const selects = page.locator('select');
  await selects.nth(0).selectOption(type);

  const titleSelect = selects.nth(1);
  if (type === 'otro') {
    await page.getByPlaceholder(/escribe el t[íi]tulo del evento/i).fill(title);
  } else if (await titleSelect.isVisible().catch(() => false)) {
    const option = titleSelect.locator(`option[value="${title}"]`);
    if (await option.count()) {
      await titleSelect.selectOption(title);
    } else {
      await titleSelect.selectOption('__custom__');
      await page.getByPlaceholder(/escribe el t[íi]tulo del evento/i).fill(title);
    }
  }

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.first().fill(eventDate);

  if (nextDueDate) {
    await dateInputs.nth(1).fill(nextDueDate);
  }

  if (description) {
    await page.locator('textarea').nth(0).fill(description);
  }

  if (notes) {
    await page.locator('textarea').nth(1).fill(notes);
  }

  await page.getByRole('button', { name: /crear evento/i }).click();
  await page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 });
}

export async function openPetFromDashboard(page: Page, petName: string) {
  const petCard = page.locator('article').filter({
    has: page.getByRole('heading', { name: new RegExp(petName, 'i') }),
  }).first();

  await expect(petCard).toBeVisible({ timeout: 15000 });

  await Promise.all([
    page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 }),
    petCard.click(),
  ]);
}

export async function extractSharedUrlFromQr(page: Page): Promise<string> {
  const shareInput = page.getByTestId('share-url-input');

  if (await shareInput.count() === 0) {
    const petCardLink = page.locator('main a[href^="/dashboard/"]').filter({
      has: page.locator('article'),
    }).first();

    if (await petCardLink.count()) {
      await Promise.all([
        page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 }),
        petCardLink.click(),
      ]);
    }
  }

  await expect(shareInput).toBeVisible({ timeout: 15000 });

  const shareUrl = await shareInput.inputValue();

  if (!shareUrl) {
    throw new Error('Shared target URL not found');
  }

  return shareUrl;
}

export async function deleteCurrentPet(page: Page) {
  let deleteButton = page.getByRole('button', { name: /^eliminar$/i }).first();

  if (await deleteButton.count() === 0) {
    const backToDetailLink = page.getByRole('link', { name: /volver al historial|volver a /i }).first();

    if (await backToDetailLink.count()) {
      await Promise.all([
        page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 }),
        backToDetailLink.click(),
      ]);
    }

    const petCardLink = page.locator('main a[href^="/dashboard/"]').filter({
      has: page.locator('article'),
    }).first();

    if (await petCardLink.count()) {
      await Promise.all([
        page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 }),
        petCardLink.click(),
      ]);
    }

    deleteButton = page.getByRole('button', { name: /^eliminar$/i }).first();
  }

  await expect(deleteButton).toBeVisible({ timeout: 15000 });
  await deleteButton.click();
  await expect(page.getByText(/eliminar mascota/i)).toBeVisible();
  await page.getByRole('button', { name: /^eliminar$/i }).last().click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
}
