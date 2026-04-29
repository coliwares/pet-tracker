import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  format,
  isPast,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { EVENT_CATALOG, EventCatalogItem, EventDueRule, SPECIES_OPTIONS } from './constants';
import { Pet, Species } from './types';

export type EventReminderStatus =
  | 'sin_recordatorio'
  | 'vencido'
  | 'hoy'
  | 'proximo'
  | 'programado';

export const EVENT_REMINDER_STATUS_LABELS: Record<EventReminderStatus, string> = {
  sin_recordatorio: 'Sin recordatorio',
  vencido: 'Vencido',
  hoy: 'Para hoy',
  proximo: 'Próximo',
  programado: 'Programado',
};

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

export function formatPetAge(birthDate: string | null): string | null {
  if (!birthDate) {
    return null;
  }

  const birthDateValue = parseLocalDate(birthDate);
  const today = new Date();
  const years = differenceInYears(today, birthDateValue);

  if (years >= 1) {
    const anniversary = addYears(birthDateValue, years);
    const remainingMonths = differenceInMonths(today, anniversary);

    if (remainingMonths > 0) {
      return `${years} ${years === 1 ? 'a\u00f1o' : 'a\u00f1os'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }

    return `${years} ${years === 1 ? 'a\u00f1o' : 'a\u00f1os'}`;
  }

  const months = differenceInMonths(today, birthDateValue);
  const monthlyAnniversary = addMonths(birthDateValue, months);
  const remainingDays = differenceInCalendarDays(today, monthlyAnniversary);

  if (months > 0) {
    if (remainingDays > 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'} y ${remainingDays} ${remainingDays === 1 ? 'd\u00eda' : 'd\u00edas'}`;
    }

    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  return `${remainingDays} ${remainingDays === 1 ? 'd\u00eda' : 'd\u00edas'}`;
}

type PetLifeStage = {
  label: string;
  className: string;
};

export function getPetLifeStage(birthDate: string | null, species: Species): PetLifeStage | null {
  if (!birthDate) {
    return null;
  }

  const ageInMonths = calculateAgeInMonths(birthDate);

  if (ageInMonths < 12) {
    return {
      label: species === 'Gato' ? 'Gatito' : species === 'Perro' ? 'Cachorro' : 'Bebe',
      className: 'bg-emerald-50 text-emerald-700',
    };
  }

  if (ageInMonths < 84) {
    return {
      label: 'Adulto',
      className: 'bg-amber-50 text-amber-700',
    };
  }

  return {
    label: 'Senior',
    className: 'bg-fuchsia-50 text-fuchsia-700',
  };
}

export function getSpeciesOption(species: Species) {
  return SPECIES_OPTIONS.find((option) => option.value === species) ?? null;
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

export function getEventReminderStatus(
  nextDueDate: string | null,
  referenceDate: Date = new Date()
): EventReminderStatus {
  if (!nextDueDate) {
    return 'sin_recordatorio';
  }

  const remainingDays = differenceInCalendarDays(parseLocalDate(nextDueDate), referenceDate);

  if (remainingDays < 0) {
    return 'vencido';
  }

  if (remainingDays === 0) {
    return 'hoy';
  }

  if (remainingDays <= 14) {
    return 'proximo';
  }

  return 'programado';
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

type CalendarEventInput = {
  title: string;
  description?: string | null;
  notes?: string | null;
  event_date: string;
  next_due_date?: string | null;
};

export function buildGoogleCalendarUrl(event: CalendarEventInput, petName?: string): string {
  const selectedDate = event.next_due_date ?? event.event_date;
  const startDate = parseLocalDate(selectedDate);
  const endDate = addDays(startDate, 1);
  const text = petName ? `${event.title} - ${petName}` : event.title;
  const details = [event.description, event.notes].filter(Boolean).join('\n\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text,
    dates: `${format(startDate, 'yyyyMMdd')}/${format(endDate, 'yyyyMMdd')}`,
  });

  if (details) {
    params.set('details', details);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
