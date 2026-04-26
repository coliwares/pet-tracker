import { expect, test } from '@playwright/test';
import { loginAsDemo } from '../helpers/auth';
import { uniqueName } from '../helpers/pets';

const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8Q0AAAAASUVORK5CYII=';

test.describe('Feedback', () => {
  test('permite enviar feedback con imagen adjunta', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/dashboard/feedback');

    await page.getByRole('button', { name: /enviar feedback/i }).click();

    const title = uniqueName('FeedbackImg');
    await page.getByLabel(/título/i).fill(title);
    await page.getByLabel(/detalle/i).fill(
      'Adjunto una imagen para mostrar mejor el problema detectado en la app.'
    );

    await page.locator('input[type="file"]').setInputFiles({
      name: 'feedback-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(tinyPngBase64, 'base64'),
    });

    await page.locator('form').getByRole('button', { name: /^enviar feedback$/i }).click();

    await expect(page.getByRole('heading', { name: new RegExp(title, 'i') })).toBeVisible();
    await expect(page.getByText(/imagen adjunta/i).first()).toBeVisible();
  });
});
