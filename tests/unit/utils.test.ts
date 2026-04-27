import { describe, expect, it } from 'vitest';
import {
  applyDueRule,
  getEventCatalogOptions,
  getEventHistoryGroup,
  getPetLifeStage,
  getSpeciesOption,
  parseLocalDate,
  validateEmail,
  validatePassword,
} from '../../src/lib/utils';
import { EVENT_CATALOG } from '../../src/lib/constants';
import type { Pet } from '../../src/lib/types';

describe('utils', () => {
  it('parseLocalDate mantiene la fecha local esperada', () => {
    const result = parseLocalDate('2026-04-10');

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(10);
  });

  it('applyDueRule calcula dias, meses y años', () => {
    expect(applyDueRule('2026-04-10', { amount: 21, unit: 'days' })).toBe('2026-05-01');
    expect(applyDueRule('2026-04-10', { amount: 3, unit: 'months' })).toBe('2026-07-10');
    expect(applyDueRule('2026-04-10', { amount: 1, unit: 'years' })).toBe('2027-04-10');
  });

  it('getPetLifeStage distingue cachorro, adulto y senior', () => {
    expect(getPetLifeStage('2025-12-01', 'Perro')?.label).toBe('Cachorro');
    expect(getPetLifeStage('2022-04-01', 'Gato')?.label).toBe('Adulto');
    expect(getPetLifeStage('2018-01-01', 'Conejo')?.label).toBe('Senior');
  });

  it('getSpeciesOption devuelve el label visible de la especie', () => {
    expect(getSpeciesOption('Huron')).toEqual({
      value: 'Huron',
      label: 'Hurón',
      pluralLabel: 'Hurones',
    });
  });

  it('getEventCatalogOptions filtra por especie y edad', () => {
    const dogPuppy: Pet = {
      id: 'pet-1',
      user_id: 'user-1',
      name: 'Max',
      species: 'Perro',
      breed: null,
      birth_date: '2025-12-01',
      weight: null,
      photo_url: null,
      license_url: null,
      notes: null,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const options = getEventCatalogOptions(EVENT_CATALOG.vacuna, dogPuppy);
    const titles = options.map((item) => item.title);

    expect(titles).toContain('Vacuna multiple cachorro - 1ra dosis');
    expect(titles).not.toContain('Vacuna triple felina anual');
    expect(titles).not.toContain('Vacuna multiple anual');
  });

  it('getEventHistoryGroup usa el historyGroup del catálogo si existe', () => {
    expect(getEventHistoryGroup('Vacuna multiple cachorro - 1ra dosis')).toBe('vacuna_multiple_cachorro');
    expect(getEventHistoryGroup('Titulo libre')).toBe('titulo libre');
  });

  it('valida email y password con reglas básicas', () => {
    expect(validateEmail('test@pettrack.cl')).toBe(true);
    expect(validateEmail('correo-invalido')).toBe(false);
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
  });
});
