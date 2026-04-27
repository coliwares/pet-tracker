import { describe, expect, it } from 'vitest';
import {
  getTutorProfileCompletionSteps,
  validateTutorPhone,
  validateTutorProfileInput,
} from '../../src/lib/tutorProfile';

describe('tutorProfile', () => {
  it('validateTutorPhone acepta formatos comunes y rechaza inválidos', () => {
    expect(validateTutorPhone('+56 9 1234 5678')).toBe(true);
    expect(validateTutorPhone('123-4567')).toBe(true);
    expect(validateTutorPhone('abc123')).toBe(false);
  });

  it('validateTutorProfileInput sanitiza campos y acepta un perfil completo válido', () => {
    const result = validateTutorProfileInput({
      full_name: '  Ana   Pérez  ',
      phone: ' +56 9 1234 5678 ',
      city: '  Santiago   Centro ',
      address: '  Calle Falsa 123  ',
      emergency_contact_name: '  Juan  Pérez ',
      emergency_contact_phone: ' +56 9 2222 3333 ',
      notes: '  Llamar primero al tutor. ',
    });

    expect(result).toEqual({
      success: true,
      data: {
        full_name: 'Ana Pérez',
        phone: '+56 9 1234 5678',
        city: 'Santiago Centro',
        address: 'Calle Falsa 123',
        emergency_contact_name: 'Juan Pérez',
        emergency_contact_phone: '+56 9 2222 3333',
        notes: 'Llamar primero al tutor.',
      },
    });
  });

  it('requiere nombre y teléfono juntos para contacto de emergencia', () => {
    const result = validateTutorProfileInput({
      full_name: 'Ana Pérez',
      phone: '+56 9 1234 5678',
      emergency_contact_name: 'Juan Pérez',
    });

    expect(result).toEqual({
      success: false,
      error: 'Completa el nombre y telefono del contacto de emergencia, o deja ambos vacios.',
    });
  });

  it('getTutorProfileCompletionSteps refleja el progreso del perfil', () => {
    expect(getTutorProfileCompletionSteps(null)).toEqual([
      { label: 'Nombre del tutor', completed: false },
      { label: 'Telefono principal', completed: false },
      { label: 'Contacto de emergencia', completed: false },
    ]);

    expect(
      getTutorProfileCompletionSteps({
        user_id: 'user-1',
        full_name: 'Ana Pérez',
        phone: '+56 9 1234 5678',
        city: null,
        address: null,
        emergency_contact_name: 'Juan Pérez',
        emergency_contact_phone: '+56 9 2222 3333',
        notes: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      })
    ).toEqual([
      { label: 'Nombre del tutor', completed: true },
      { label: 'Telefono principal', completed: true },
      { label: 'Contacto de emergencia', completed: true },
    ]);
  });
});
