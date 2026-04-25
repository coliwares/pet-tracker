'use client';

import { useMemo, useState } from 'react';
import { HeartHandshake, MapPin, Phone, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TutorProfile } from '@/lib/types';
import { getTutorProfileCompletionSteps, validateTutorProfileInput } from '@/lib/tutorProfile';
import { updateTutorProfile } from '@/lib/supabase';

type TutorProfileFormProps = {
  initialProfile: TutorProfile | null;
  userEmail: string;
  unavailableMessage?: string | null;
};

type TutorProfileFormState = {
  full_name: string;
  phone: string;
  city: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
};

function buildFormState(profile: TutorProfile | null): TutorProfileFormState {
  return {
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    address: profile?.address ?? '',
    emergency_contact_name: profile?.emergency_contact_name ?? '',
    emergency_contact_phone: profile?.emergency_contact_phone ?? '',
    notes: profile?.notes ?? '',
  };
}

export function TutorProfileForm({
  initialProfile,
  userEmail,
  unavailableMessage,
}: TutorProfileFormProps) {
  const [form, setForm] = useState<TutorProfileFormState>(() => buildFormState(initialProfile));
  const [savedProfile, setSavedProfile] = useState<TutorProfile | null>(initialProfile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const completionSteps = useMemo(() => {
    return getTutorProfileCompletionSteps(savedProfile ?? null);
  }, [savedProfile]);

  const completedCount = completionSteps.filter((step) => step.completed).length;
  const isUnavailable = Boolean(unavailableMessage);

  const updateField = (field: keyof TutorProfileFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validation = validateTutorProfileInput(form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    try {
      setLoading(true);
      const profile = await updateTutorProfile(validation.data);
      setSavedProfile(profile);
      setForm(buildFormState(profile));
      setSuccess('Perfil del tutor guardado correctamente.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Perfil principal</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Datos del tutor responsable
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Este perfil nos ayuda a mostrar mejor el contexto del tutor y a dejar un contacto claro cuando compartes información de tus mascotas.
          </p>
        </div>

        {isUnavailable ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {unavailableMessage}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombre completo *"
            value={form.full_name}
            onChange={(event) => updateField('full_name', event.target.value)}
            placeholder="Ej.: Camila Soto"
            disabled={isUnavailable || loading}
            required
          />
          <Input
            label="Telefono principal *"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="Ej.: +56 9 1234 5678"
            disabled={isUnavailable || loading}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Ciudad o comuna"
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            placeholder="Ej.: Providencia"
            disabled={isUnavailable || loading}
          />
          <Input
            label="Direccion"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Ej.: Av. Siempre Viva 123"
            disabled={isUnavailable || loading}
          />
        </div>

        <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50/70 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 text-rose-600 shadow-sm">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Contacto de emergencia</h3>
              <p className="text-sm text-slate-600">
                Si completas uno de estos campos, te pediremos ambos.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre del contacto"
              value={form.emergency_contact_name}
              onChange={(event) => updateField('emergency_contact_name', event.target.value)}
              placeholder="Ej.: Diego Perez"
              disabled={isUnavailable || loading}
            />
            <Input
              label="Telefono del contacto"
              value={form.emergency_contact_phone}
              onChange={(event) => updateField('emergency_contact_phone', event.target.value)}
              placeholder="Ej.: +56 9 8765 4321"
              disabled={isUnavailable || loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Notas del tutor</label>
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Horario ideal de contacto, indicaciones de entrega, observaciones utiles..."
            rows={5}
            disabled={isUnavailable || loading}
            className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Email de acceso</label>
          <input
            value={userEmail}
            disabled
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-500"
          />
          <p className="text-xs text-slate-500">Este dato viene de tu cuenta y no se edita desde aqui.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading || isUnavailable}>
          {loading ? 'Guardando perfil...' : 'Guardar perfil'}
        </Button>
      </form>

      <aside className="space-y-4">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Progreso</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-black tracking-tight text-slate-950">
                {completedCount}/{completionSteps.length}
              </p>
              <p className="text-sm text-slate-600">bloques principales completados</p>
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <UserRound className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {completionSteps.map((step) => (
              <div
                key={step.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{step.label}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                    step.completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {step.completed ? 'Listo' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2">
              <Phone className="h-5 w-5" />
            </div>
            <div className="rounded-2xl bg-white/10 p-2">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight">Para que sirve este perfil</h3>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Te deja lista la información del tutor para futuros flujos de contacto, contexto compartido y mejoras del carnet.
          </p>
        </section>
      </aside>
    </div>
  );
}
