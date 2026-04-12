import { format, isPast, isSameDay, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'd MMM yyyy', { locale: es });
}

export function formatDateMonthYear(dateString: string): string {
  return format(new Date(dateString), 'MMMM yyyy', { locale: es });
}

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), new Date(birthDate));
}

export function isPastDate(dateString: string): boolean {
  return isPast(new Date(dateString));
}

export function isSameDayDate(dateString1: string, dateString2: string): boolean {
  return isSameDay(new Date(dateString1), new Date(dateString2));
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
