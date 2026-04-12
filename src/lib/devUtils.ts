/**
 * Utilidades para desarrollo
 * Facilita el testing evitando rate limits
 */

/**
 * Genera email único para testing en desarrollo
 *
 * @example
 * generateDevEmail('test@gmail.com')
 * // Desarrollo: 'test+dev345678@gmail.com'
 * // Producción: 'test@gmail.com'
 */
export function generateDevEmail(baseEmail: string): string {
  // Solo en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return baseEmail;
  }

  const [name, domain] = baseEmail.split('@');
  if (!name || !domain) return baseEmail;

  // Usar timestamp para hacer email único
  const timestamp = Date.now().toString().slice(-6); // últimos 6 dígitos

  return `${name}+dev${timestamp}@${domain}`;
}

/**
 * Limpia el email de sufijos de desarrollo
 *
 * @example
 * cleanDevEmail('test+dev123456@gmail.com')
 * // 'test@gmail.com'
 */
export function cleanDevEmail(email: string): string {
  return email.replace(/\+dev\d+@/, '@');
}

/**
 * Verifica si estamos en modo desarrollo
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log de desarrollo (solo muestra en dev)
 */
export function devLog(...args: any[]) {
  if (isDevelopment()) {
    console.log('🔧 [DEV]', ...args);
  }
}

/**
 * Genera múltiples emails de prueba
 */
export function generateTestEmails(baseEmail: string, count: number = 5): string[] {
  const emails: string[] = [];
  const [name, domain] = baseEmail.split('@');

  for (let i = 1; i <= count; i++) {
    emails.push(`${name}+test${i}@${domain}`);
  }

  return emails;
}
