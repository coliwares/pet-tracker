import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildQrCodeUrl, copyTextToClipboard } from './share';

describe('buildQrCodeUrl', () => {
  it('encodes the shared target URL in the qr service URL', () => {
    const shareUrl = 'https://pettrack.cl/share/token-123';
    const qrUrl = new URL(buildQrCodeUrl(shareUrl));

    expect(qrUrl.origin).toBe('https://api.qrserver.com');
    expect(qrUrl.searchParams.get('data')).toBe(shareUrl);
    expect(qrUrl.searchParams.get('size')).toBe('220x220');
  });

  it('adds a cache-busting retry parameter for later attempts', () => {
    const qrUrl = new URL(buildQrCodeUrl('https://pettrack.cl/share/token-123', 2));

    expect(qrUrl.searchParams.get('reload')).toBe('2');
  });
});

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses navigator.clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText } },
      configurable: true,
    });

    await copyTextToClipboard('hola');

    expect(writeText).toHaveBeenCalledWith('hola');
  });

  it('falls back to document.execCommand when clipboard is unavailable', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
    });

    const execCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    await copyTextToClipboard('hola fallback');

    expect(execCommand).toHaveBeenCalledWith('copy');
  });
});
