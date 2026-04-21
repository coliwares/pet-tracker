'use client';

import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail } from '@/lib/utils';

const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;
const MAX_NAME_LENGTH = 80;

export function BetaAccessRequestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoadedAt] = useState(() => Date.now());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedReason = reason.trim();

    if (trimmedName.length < 2 || trimmedName.length > MAX_NAME_LENGTH) {
      setError('Ingresa tu nombre (entre 2 y 80 caracteres).');
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Ingresa un email valido.');
      return;
    }

    if (
      trimmedReason.length < MIN_REASON_LENGTH ||
      trimmedReason.length > MAX_REASON_LENGTH
    ) {
      setError('Cuéntanos un poco mas (entre 20 y 500 caracteres).');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/beta-access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: normalizedEmail,
          reason: trimmedReason,
          honeypot,
          formLoadedAt,
          source: 'signup_closed',
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'No pudimos registrar tu solicitud.');
      }

      setSuccess(data.message ?? 'Solicitud enviada. Te contactaremos pronto.');
      setName('');
      setEmail('');
      setReason('');
      setHoneypot('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No pudimos registrar tu solicitud.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
        <h3 className="text-lg font-bold text-amber-900">Acceso beta por invitación</h3>
        <p className="mt-1 text-sm text-amber-800">
          El registro está cerrado temporalmente. Déjanos tus datos y te avisamos cuando
          habilitemos tu acceso.
        </p>
      </div>

      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] h-px w-px opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Input
        label="Nombre"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        maxLength={MAX_NAME_LENGTH}
        required
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          ¿Por qué quieres acceso beta?
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ejemplo: quiero ordenar vacunas y controles de mis mascotas..."
          minLength={MIN_REASON_LENGTH}
          maxLength={MAX_REASON_LENGTH}
          required
          className="min-h-28 w-full resize-y rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="mt-2 text-right text-xs text-gray-500">
          {reason.length}/{MAX_REASON_LENGTH}
        </p>
      </div>

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

      <Button
        type="submit"
        className="w-full py-3"
        disabled={loading}
        aria-label="Solicitar acceso beta"
      >
        {loading ? 'Enviando solicitud...' : 'Solicitar acceso beta'}
      </Button>
    </form>
  );
}
