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

export async function createEvent(
  page: Page,
  options: {
    type?: 'vacuna' | 'visita' | 'medicina' | 'otro';
    title?: string;
    eventDate?: string;
    nextDueDate?: string;
  }
) {
  const {
    type = 'visita',
    title = 'Control anual',
    eventDate = '2026-04-10',
    nextDueDate,
  } = options;

  await page.getByRole('link', { name: /agregar evento/i }).first().click();
  await expect(page).toHaveURL(/\/events\/new$/);

  const selects = page.locator('select');
  await selects.nth(0).selectOption(type);

  const titleSelect = selects.nth(1);
  if (await titleSelect.isVisible().catch(() => false)) {
    const option = titleSelect.locator(`option[value="${title}"]`);
    if (await option.count()) {
      await titleSelect.selectOption(title);
    } else {
      await titleSelect.selectOption('__custom__');
      await page.locator('input[required]').last().fill(title);
    }
  }

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.first().fill(eventDate);

  if (nextDueDate) {
    await dateInputs.nth(1).fill(nextDueDate);
  }

  await page.getByRole('button', { name: /crear evento/i }).click();
  await page.waitForURL(/\/dashboard\/[^/]+$/, { timeout: 15000 });
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
  const deleteButton = page.getByRole('button', { name: /^eliminar$/i }).first();

  if (await deleteButton.count() === 0) {
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

  await expect(deleteButton).toBeVisible({ timeout: 15000 });
  await deleteButton.click();
  await expect(page.getByText(/eliminar mascota/i)).toBeVisible();
  await page.getByRole('button', { name: /^eliminar$/i }).last().click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
}
