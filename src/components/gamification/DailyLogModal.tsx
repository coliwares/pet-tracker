'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DAILY_CARE_DEFAULTS, mergeDailyCareLog } from '@/lib/gamification';
import { DailyCareLog, DailyCareLogInput, SymptomSeverity } from '@/lib/types';

type DailyLogModalProps = {
  isOpen: boolean;
  petId: string;
  petName: string;
  logDate: string;
  initialLog: DailyCareLog;
  onClose: () => void;
  onSave: (input: DailyCareLogInput) => Promise<void>;
};

const SYMPTOM_OPTIONS: Array<{ value: SymptomSeverity; label: string }> = [
  { value: 'none', label: 'Sin sintomas' },
  { value: 'minor', label: 'Sintomas menores' },
  { value: 'severe', label: 'Sintomas severos' },
];

export function DailyLogModal({
  isOpen,
  petId,
  petName,
  logDate,
  initialLog,
  onClose,
  onSave,
}: DailyLogModalProps) {
  const merged = mergeDailyCareLog(petId, logDate, initialLog);
  const [form, setForm] = useState<DailyCareLogInput>(() => ({
    pet_id: petId,
    log_date: logDate,
    meals_logged: merged.meals_logged,
    breakfast_completed: merged.breakfast_completed,
    lunch_completed: merged.lunch_completed,
    dinner_completed: merged.dinner_completed,
    hydration_logged: merged.hydration_logged,
    hydration_ml: merged.hydration_ml,
    exercise_logged: merged.exercise_logged,
    exercise_minutes: merged.exercise_minutes,
    health_logged: merged.health_logged,
    symptoms_severity: merged.symptoms_severity,
    care_logged: merged.care_logged,
    medicines_on_time: merged.medicines_on_time,
    grooming_completed: merged.grooming_completed,
    ears_eyes_cleaning_completed: merged.ears_eyes_cleaning_completed,
    notes: merged.notes,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave({
        ...form,
        pet_id: petId,
        log_date: logDate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el tracking diario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tracking diario de ${petName}`}
      onConfirm={handleSave}
      confirmLabel={saving ? 'Guardando...' : 'Guardar tracking'}
      cancelLabel="Cerrar"
      loading={saving}
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-500">
          Actualiza el progreso del dia {logDate}. Puedes guardar varias veces y el registro se
          reemplaza para esta fecha.
        </p>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Alimentacion</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    meals_logged: true,
                  }))
                }
              >
                Marcar categoria
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ['breakfast_completed', 'Desayuno'],
                ['lunch_completed', 'Almuerzo'],
                ['dinner_completed', 'Cena'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof DailyCareLogInput])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        meals_logged: true,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Hidratacion</h4>
            <label className="block text-sm font-medium text-slate-700">
              Mililitros registrados
              <input
                type="number"
                min={0}
                step={100}
                value={form.hydration_ml}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hydration_logged: true,
                    hydration_ml: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Ejercicio</h4>
            <label className="block text-sm font-medium text-slate-700">
              Minutos totales del dia
              <input
                type="number"
                min={0}
                step={5}
                value={form.exercise_minutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    exercise_logged: true,
                    exercise_minutes: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Salud</h4>
            <select
              value={form.symptoms_severity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  health_logged: true,
                  symptoms_severity: event.target.value as SymptomSeverity,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              {SYMPTOM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4 xl:col-span-2">
            <h4 className="font-semibold text-slate-900">Cuidados y medicinas</h4>
            <div className="grid gap-2 lg:grid-cols-3">
              {[
                ['medicines_on_time', 'Medicinas a tiempo'],
                ['grooming_completed', 'Grooming o cepillado'],
                ['ears_eyes_cleaning_completed', 'Limpieza de orejas u ojos'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof DailyCareLogInput])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        care_logged: true,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2 xl:col-span-2">
            <h4 className="font-semibold text-slate-900">Notas</h4>
            <textarea
              rows={4}
              value={form.notes ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value.trim().length === 0 ? null : event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="Detalles del dia, comportamiento o recordatorios."
            />
          </section>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
