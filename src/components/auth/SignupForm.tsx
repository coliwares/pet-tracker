'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase';
import { validateEmail, validatePassword } from '@/lib/utils';
import { generateDevEmail, isDevelopment } from '@/lib/devUtils';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Campo trampa para bots
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting: 3 intentos por minuto
  const { checkLimit, recordAttempt, reset } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 60000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 🛡️ Protección 1: Honeypot - detectar bots
    if (honeypot !== '') {
      console.warn('🤖 Bot detected - honeypot filled');
      // No mostrar error, solo ignorar silenciosamente
      setLoading(true);
      setTimeout(() => {
        setError('Error al crear cuenta');
        setLoading(false);
      }, 2000);
      return;
    }

    // 🛡️ Protección 2: Rate limiting
    try {
      checkLimit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demasiados intentos');
      return;
    }

    if (!validateEmail(email)) {
      recordAttempt();
      setError('Email inválido');
      return;
    }

    if (!validatePassword(password)) {
      recordAttempt();
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      recordAttempt();
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      // 🔧 En desarrollo, genera email único para evitar rate limits
      const finalEmail = generateDevEmail(email);

      if (isDevelopment() && finalEmail !== email) {
        console.log('🔧 [DEV] Email transformado:', email, '→', finalEmail);
      }

      await signUp(finalEmail, password);
      reset(); // Reset rate limiter en éxito
      router.push('/dashboard');
    } catch (err) {
      recordAttempt();
      setError(err instanceof Error ? err.message : 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🛡️ Campo honeypot - invisible para humanos, visible para bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="space-y-1">
        <Input
          type="email"
          label="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
        <p className="text-xs text-gray-500 ml-1">Usaremos este email para tu cuenta</p>
      </div>

      <div className="space-y-1">
        <Input
          type="password"
          label="🔒 Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
        <p className="text-xs text-gray-500 ml-1">Al menos 6 caracteres</p>
      </div>

      <div className="space-y-1">
        <Input
          type="password"
          label="✅ Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu contraseña"
          required
        />
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <Button type="submit" className="w-full text-lg py-4 mt-8" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </span>
        ) : (
          <span>🚀 Crear cuenta gratis</span>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Al crear una cuenta, aceptas nuestros términos de servicio
      </p>
    </form>
  );
}
