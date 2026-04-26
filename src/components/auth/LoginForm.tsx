'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signInWithGoogle } from '@/lib/supabase';

interface LoginFormProps {
  initialError?: string;
  isDemo?: boolean;
}

function getErrorMessage(initialError?: string) {
  if (initialError === 'invalid-credentials') {
    return 'Error: credenciales inválidas';
  }

  if (initialError === 'invite-link') {
    return 'Error: enlace de invitación inválido o expirado';
  }

  if (initialError === 'validation') {
    return 'Error: revisa el email y la contraseña';
  }

  return '';
}

export function LoginForm({ initialError = '', isDemo = false }: LoginFormProps) {
  const [email, setEmail] = useState(() => (isDemo ? 'test@pettrack.cl' : ''));
  const [password, setPassword] = useState(() => (isDemo ? 'pettrack' : ''));
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      await signInWithGoogle();
    } catch {
      setGoogleError('No se pudo iniciar sesión con Google. Intenta de nuevo.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        data-testid="login-google"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
      </button>

      {googleError ? (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          {googleError}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400 font-medium">o ingresa con tu cuenta</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form action="/auth/login" method="post" className="space-y-6">
        <div className="space-y-1">
          <Input
            type="email"
            name="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="space-y-1">
          <Input
            type="password"
            name="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            minLength={6}
            required
          />
        </div>

        {getErrorMessage(initialError) ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
            {getErrorMessage(initialError)}
          </div>
        ) : null}

        <Button type="submit" className="w-full text-lg py-4 mt-8" data-testid="login-submit">
          <span>Ingresar a mi cuenta</span>
        </Button>
      </form>
    </div>
  );
}
