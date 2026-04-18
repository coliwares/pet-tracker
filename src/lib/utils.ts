import { format, isPast, isSameDay, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

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

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), parseLocalDate(birthDate));
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
