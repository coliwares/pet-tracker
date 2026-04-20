'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  initialError?: string;
  isDemo?: boolean;
}

function getErrorMessage(initialError?: string) {
  if (initialError === 'invalid-credentials') {
    return 'Error: credenciales inválidas';
  }

  if (initialError === 'validation') {
    return 'Error: revisa el email y la contraseña';
  }

  return '';
}

export function LoginForm({ initialError = '', isDemo = false }: LoginFormProps) {
  const [email, setEmail] = useState(() => (isDemo ? 'test@pettrack.cl' : ''));
  const [password, setPassword] = useState(() => (isDemo ? 'pettrack' : ''));

  useEffect(() => {
    if (isDemo) {
      setEmail('test@pettrack.cl');
      setPassword('pettrack');
    }
  }, [isDemo]);

  return (
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

      {getErrorMessage(initialError) && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          {getErrorMessage(initialError)}
        </div>
      )}

      <Button type="submit" className="w-full text-lg py-4 mt-8" data-testid="login-submit">
        <span>Ingresar a mi cuenta</span>
      </Button>
    </form>
  );
}
