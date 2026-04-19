import { addDays, addMonths, addYears, differenceInMonths, differenceInYears, format, isPast, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { EVENT_CATALOG, EventCatalogItem, EventDueRule } from './constants';
import { Pet } from './types';

/**
 * Parsea una fecha en formato YYYY-MM-DD como fecha local (sin conversión UTC)
 * Soluciona el problema de zona horaria donde "2026-04-10" se mostraba como "2026-04-09"
 */
export function parseLocalDate(dateString: string | Date): Date {
  if (!dateString) return new Date();

  // Si ya es una fecha válida, retornarla
  if (dateString instanceof Date) return dateString;

  // Formato: "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(Number);

  // Crear fecha local (mes es 0-indexed en JavaScript)
  return new Date(year, month - 1, day);
}

export function formatDate(dateString: string): string {
  return format(parseLocalDate(dateString), 'd MMM yyyy', { locale: es });
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
}

export function formatDateMonthYear(dateString: string): string {
  return format(parseLocalDate(dateString), 'MMMM yyyy', { locale: es });
}

export function toDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function applyDueRule(eventDate: string, rule?: EventDueRule): string | null {
  if (!eventDate || !rule) {
    return null;
  }

  const baseDate = parseLocalDate(eventDate);
  const nextDate =
    rule.unit === 'years'
      ? addYears(baseDate, rule.amount)
      : rule.unit === 'months'
        ? addMonths(baseDate, rule.amount)
        : addDays(baseDate, rule.amount);

  return toDateInputValue(nextDate);
}

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), parseLocalDate(birthDate));
}

export function calculateAgeInMonths(birthDate: string): number {
  return differenceInMonths(new Date(), parseLocalDate(birthDate));
}

export function getEventCatalogOptions(catalog: readonly EventCatalogItem[], pet: Pet | null): EventCatalogItem[] {
  if (!pet) {
    return [...catalog];
  }

  const ageInMonths = pet.birth_date ? calculateAgeInMonths(pet.birth_date) : null;

  return catalog.filter((item) => {
    if (item.species && !item.species.includes(pet.species)) {
      return false;
    }

    if (ageInMonths !== null && item.minAgeMonths !== undefined && ageInMonths < item.minAgeMonths) {
      return false;
    }

    if (ageInMonths !== null && item.maxAgeMonths !== undefined && ageInMonths > item.maxAgeMonths) {
      return false;
    }

    return true;
  });
}

export function getEventHistoryGroup(title: string): string {
  const normalizedTitle = title.trim().toLowerCase();

  for (const catalogItems of Object.values(EVENT_CATALOG)) {
    for (const item of catalogItems) {
      if (item.title.trim().toLowerCase() === normalizedTitle) {
        return item.historyGroup ?? normalizedTitle;
      }
    }
  }

  return normalizedTitle;
}

export function isPastDate(dateString: string): boolean {
  return isPast(parseLocalDate(dateString));
}

export function isSameDayDate(dateString1: string, dateString2: string): boolean {
  return isSameDay(parseLocalDate(dateString1), parseLocalDate(dateString2));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}
