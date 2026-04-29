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
      full_name: '  Ana   Perez  ',
      phone: ' +56 9 1234 5678 ',
      city: '  Santiago   Centro ',
      address: '  Calle Falsa 123  ',
      emergency_contact_name: '  Juan  Perez ',
      emergency_contact_phone: ' +56 9 2222 3333 ',
      notes: '  Llamar primero al tutor. ',
    });

    expect(result).toEqual({
      success: true,
      data: {
        full_name: 'Ana Perez',
        phone: '+56 9 1234 5678',
        city: 'Santiago Centro',
        address: 'Calle Falsa 123',
        emergency_contact_name: 'Juan Perez',
        emergency_contact_phone: '+56 9 2222 3333',
        notes: 'Llamar primero al tutor.',
      },
    });
  });

  it('requiere nombre y teléfono juntos para contacto de emergencia', () => {
    const result = validateTutorProfileInput({
      full_name: 'Ana Perez',
      phone: '+56 9 1234 5678',
      emergency_contact_name: 'Juan Perez',
    });

    expect(result).toEqual({
      success: false,
      error: 'Completa el nombre y teléfono del contacto de emergencia, o deja ambos vacíos.',
    });
  });

  it('getTutorProfileCompletionSteps refleja el progreso del perfil', () => {
    expect(getTutorProfileCompletionSteps(null)).toEqual([
      { label: 'Nombre del tutor', completed: false },
      { label: 'Teléfono principal', completed: false },
      { label: 'Contacto de emergencia', completed: false },
    ]);

    expect(
      getTutorProfileCompletionSteps({
        full_name: 'Ana Perez',
        phone: '+56 9 1234 5678',
        emergency_contact_name: 'Juan Perez',
        emergency_contact_phone: '+56 9 2222 3333',
      })
    ).toEqual([
      { label: 'Nombre del tutor', completed: true },
      { label: 'Teléfono principal', completed: true },
      { label: 'Contacto de emergencia', completed: true },
    ]);
  });

  it('getTutorProfileCompletionSteps ignora espacios al calcular progreso', () => {
    expect(
      getTutorProfileCompletionSteps({
        full_name: '   ',
        phone: ' +56 9 1234 5678 ',
        emergency_contact_name: '   ',
        emergency_contact_phone: '   ',
      })
    ).toEqual([
      { label: 'Nombre del tutor', completed: false },
      { label: 'Teléfono principal', completed: true },
      { label: 'Contacto de emergencia', completed: false },
    ]);
  });
});
