'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';
import { validateEmail, validatePassword } from '@/lib/utils';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  isDemo?: boolean;
}

export function LoginForm({ isDemo = false }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting: 5 intentos por minuto (más permisivo que signup)
  const { checkLimit, recordAttempt, reset } = useRateLimiter({
    maxAttempts: 5,
    windowMs: 60000
  });

  // Autocompletar credenciales demo si viene de la landing
  useEffect(() => {
    if (isDemo) {
      setEmail('test@pettrack.cl');
      setPassword('pettrack');
    }
  }, [isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 🛡️ Rate limiting
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

    try {
      setLoading(true);
      await signIn(email, password);
      reset(); // Reset rate limiter en éxito
      router.push('/dashboard');
    } catch (err) {
      recordAttempt();
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <Input
          type="email"
          label="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="space-y-1">
        <Input
          type="password"
          label="🔒 Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
            Ingresando...
          </span>
        ) : (
          <span>✨ Ingresar a mi cuenta</span>
        )}
      </Button>
    </form>
  );
}
