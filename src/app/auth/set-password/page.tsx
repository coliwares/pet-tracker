'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const verifySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setCheckingSession(false);
        return;
      }

      // En enlaces de invitacion, la sesion puede establecerse unos instantes despues.
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (nextSession) {
          setCheckingSession(false);
        }
      });

      const timeoutId = setTimeout(async () => {
        const {
          data: { session: fallbackSession },
        } = await supabase.auth.getSession();

        if (fallbackSession) {
          setCheckingSession(false);
          return;
        }

        router.replace('/login?error=invite-link');
      }, 4000);

      return () => {
        subscription.subscription.unsubscribe();
        clearTimeout(timeoutId);
      };
    };

    let cleanup: (() => void) | undefined;
    void verifySession().then((maybeCleanup) => {
      cleanup = maybeCleanup;
    });

    return () => {
      cleanup?.();
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Contraseña configurada correctamente. Redirigiendo a login...');
      setTimeout(() => {
        router.replace('/login?password=updated');
      }, 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo actualizar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <Container className="max-w-md w-full">
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-8 text-center shadow-card">
            <p className="text-gray-700 font-semibold">Validando invitación...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crea tu contraseña
          </h1>
          <p className="mt-2 text-gray-600">
            Define tu contraseña para finalizar la activación de tu cuenta beta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-card space-y-6"
        >
          <Input
            type="password"
            label="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />

          <Input
            type="password"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            minLength={6}
            required
          />

          {error ? (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          ) : null}

          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      </Container>
    </div>
  );
}
