import { expect, test, type Page } from '@playwright/test';
import { loginAsDemo } from '../helpers/auth';
import { uniqueName } from '../helpers/pets';

type TutorProfileSnapshot = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  notes: string;
};

function profileInput(page: Page, placeholder: RegExp) {
  return page.getByPlaceholder(placeholder);
}

async function goToProfile(page: Page) {
  await page.goto('/dashboard/profile');
  await expect(page.getByRole('heading', { name: /perfil del tutor/i })).toBeVisible();
}

async function readProfileSnapshot(page: Page): Promise<TutorProfileSnapshot> {
  return {
    fullName: await profileInput(page, /camila soto/i).inputValue(),
    phone: await profileInput(page, /\+56 9 1234 5678/i).inputValue(),
    city: await profileInput(page, /providencia/i).inputValue(),
    address: await profileInput(page, /siempre viva 123/i).inputValue(),
    emergencyName: await profileInput(page, /diego perez/i).inputValue(),
    emergencyPhone: await profileInput(page, /\+56 9 8765 4321/i).inputValue(),
    notes: await page.getByPlaceholder(/horario ideal de contacto/i).inputValue(),
  };
}

async function fillProfile(page: Page, snapshot: TutorProfileSnapshot) {
  await profileInput(page, /camila soto/i).fill(snapshot.fullName);
  await profileInput(page, /\+56 9 1234 5678/i).fill(snapshot.phone);
  await profileInput(page, /providencia/i).fill(snapshot.city);
  await profileInput(page, /siempre viva 123/i).fill(snapshot.address);
  await profileInput(page, /diego perez/i).fill(snapshot.emergencyName);
  await profileInput(page, /\+56 9 8765 4321/i).fill(snapshot.emergencyPhone);
  await page.getByPlaceholder(/horario ideal de contacto/i).fill(snapshot.notes);
}

test.describe('Perfil del tutor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('valida que el contacto de emergencia quede completo o vacío', async ({ page }) => {
    await goToProfile(page);

    const unavailableAlert = page.getByText(/falta aplicar la migración de tutor_profiles/i);
    if (await unavailableAlert.isVisible().catch(() => false)) {
      await expect(unavailableAlert).toBeVisible();
      await expect(page.getByRole('button', { name: /guardar perfil|guardar cambios/i })).toBeDisabled();
      return;
    }

    const snapshot = await readProfileSnapshot(page);

    try {
      await profileInput(page, /camila soto/i).fill(snapshot.fullName || 'Perfil Demo');
      await profileInput(page, /\+56 9 1234 5678/i).fill(snapshot.phone || '+56 9 1111 2222');
      await profileInput(page, /diego perez/i).fill('Solo Nombre');
      await profileInput(page, /\+56 9 8765 4321/i).fill('');
      await page.getByRole('button', { name: /guardar perfil|guardar cambios/i }).click();

      await expect(
        page.getByText(/completa el nombre y teléfono del contacto de emergencia, o deja ambos vacíos/i)
      ).toBeVisible();
    } finally {
      await fillProfile(page, snapshot);
    }
  });

  test('muestra el estado inicial del perfil y actualiza el progreso cuando ya existe base restaurable', async ({ page }) => {
    await goToProfile(page);

    const unavailableAlert = page.getByText(/falta aplicar la migración de tutor_profiles/i);
    if (await unavailableAlert.isVisible().catch(() => false)) {
      await expect(unavailableAlert).toBeVisible();
      await expect(page.getByRole('button', { name: /guardar perfil|guardar cambios/i })).toBeDisabled();
      return;
    }

    const snapshot = await readProfileSnapshot(page);

    if (!snapshot.fullName || !snapshot.phone) {
      await expect(page.getByText(/0\/3/i)).toBeVisible();
      await expect(page.getByText(/nombre del tutor/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /guardar perfil/i })).toBeVisible();
      return;
    }

    const uniqueSuffix = uniqueName('Tutor').replace(/^Tutor-/, '');
    const nextProfile: TutorProfileSnapshot = {
      fullName: `Tutor ${uniqueSuffix}`,
      phone: '+56 9 1234 5678',
      city: 'Providencia',
      address: 'Av. Siempre Viva 123',
      emergencyName: 'Diego Perez',
      emergencyPhone: '+56 9 8765 4321',
      notes: `Perfil actualizado ${uniqueSuffix}`,
    };

    try {
      await fillProfile(page, nextProfile);
      await page.getByRole('button', { name: /guardar perfil|guardar cambios/i }).click();

      await expect(page.getByText(/perfil del tutor guardado correctamente/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/3\/3/i)).toBeVisible();
      await expect(page.getByText(/contacto de emergencia/i).nth(1)).toBeVisible();
      await expect(profileInput(page, /camila soto/i)).toHaveValue(nextProfile.fullName);
      await expect(profileInput(page, /\+56 9 8765 4321/i)).toHaveValue(nextProfile.emergencyPhone);
    } finally {
      await fillProfile(page, snapshot);
      await page.getByRole('button', { name: /guardar perfil|guardar cambios/i }).click();
      await expect(page.getByRole('button', { name: /guardar perfil|guardar cambios/i })).toBeEnabled({ timeout: 15000 });
    }
  });
});
