import { describe, expect, it } from 'vitest';
import { validateFeedbackInput } from '../../src/lib/feedback';

describe('validateFeedbackInput', () => {
  it('acepta feedback válido y sanitiza strings', () => {
    const result = validateFeedbackInput(
      {
        type: 'bug',
        title: '  Error en dashboard  ',
        message: '  El panel se rompe al abrir una mascota.  ',
      },
      'user-1'
    );

    expect(result).toEqual({
      success: true,
      data: {
        type: 'bug',
        title: 'Error en dashboard',
        message: 'El panel se rompe al abrir una mascota.',
        image_url: null,
      },
    });
  });

  it('rechaza tipos inválidos', () => {
    const result = validateFeedbackInput({
      type: 'otro',
      title: 'Titulo válido',
      message: 'Mensaje suficientemente largo',
    });

    expect(result).toEqual({
      success: false,
      error: 'Tipo de feedback inválido.',
    });
  });

  it('rechaza imagen adjunta fuera del ownership del usuario', () => {
    const result = validateFeedbackInput(
      {
        type: 'mejora',
        title: 'Agregar filtros',
        message: 'Sería útil poder filtrar por prioridad y fecha.',
        image_url: 'https://example.supabase.co/storage/v1/object/public/pet-photos/other-user/file.png',
      },
      'user-1'
    );

    expect(result).toEqual({
      success: false,
      error: 'La imagen adjunta no es válida para tu cuenta.',
    });
  });

  it('acepta imagen adjunta del usuario correcto', () => {
    const result = validateFeedbackInput(
      {
        type: 'mejora',
        title: 'Agregar filtros',
        message: 'Sería útil poder filtrar por prioridad y fecha.',
        image_url: 'https://example.supabase.co/storage/v1/object/public/pet-photos/user-1/feedback.png',
      },
      'user-1'
    );

    expect(result).toEqual({
      success: true,
      data: {
        type: 'mejora',
        title: 'Agregar filtros',
        message: 'Sería útil poder filtrar por prioridad y fecha.',
        image_url: 'https://example.supabase.co/storage/v1/object/public/pet-photos/user-1/feedback.png',
      },
    });
  });
});
