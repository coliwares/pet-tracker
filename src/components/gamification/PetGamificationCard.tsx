'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Flame, Sparkles, Target, Trophy } from 'lucide-react';
import { CircularScore } from '@/components/gamification/CircularScore';
import { DailyLogModal } from '@/components/gamification/DailyLogModal';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Toast } from '@/components/ui/Toast';
import {
  MAX_DAILY_POINTS,
  buildMonthlyHeatmap,
  buildPetGamificationSummary,
  getChallengeWindowLabel,
  getScoreTone,
  getStreakVisual,
} from '@/lib/gamification';
import { useDailyCareLogs } from '@/hooks/useDailyCareLogs';
import { DailyCareLogInput, Pet } from '@/lib/types';
import { formatDateMonthYear, toDateInputValue } from '@/lib/utils';
import { PetPhoto } from '@/components/pet/PetPhoto';

type PetGamificationCardProps = {
  pet: Pet;
  compact?: boolean;
};

const CATEGORY_META = [
  { key: 'feeding', label: 'Alimentacion', max: 10, hint: 'Desayuno, almuerzo y cena' },
  { key: 'hydration', label: 'Hidratacion', max: 5, hint: 'Objetivo diario de agua' },
  { key: 'exercise', label: 'Ejercicio', max: 15, hint: 'Minutos activos del dia' },
  { key: 'health', label: 'Salud', max: 10, hint: 'Chequeo de sintomas' },
  { key: 'care', label: 'Cuidados', max: 10, hint: 'Medicinas, grooming y limpieza' },
  { key: 'consistency', label: 'Consistencia', max: 5, hint: '80% del tracking completo' },
] as const;

export function PetGamificationCard({ pet, compact = false }: PetGamificationCardProps) {
  const today = toDateInputValue(new Date());
  const { logs, currentLog, loading, saveLog } = useDailyCareLogs(pet.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const summary = useMemo(() => buildPetGamificationSummary(pet.id, logs), [logs, pet.id]);
  const heatmap = useMemo(() => buildMonthlyHeatmap(logs), [logs]);
  const streakVisual = getStreakVisual(summary.generalStreak.current);
  const NameTag = compact ? 'h3' : 'div';

  const handleSave = async (input: DailyCareLogInput) => {
    await saveLog(input);
    setToast({ message: 'Tracking diario actualizado', type: 'success' });
  };

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Loading text={`Cargando progreso de ${pet.name}...`} />
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#fffaf5_100%)] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <PetPhoto
                name={pet.name}
                photoUrl={pet.photo_url}
                sizeClassName="h-16 w-16 rounded-[1.2rem]"
                imageClassName="object-cover ring-4 ring-amber-100 shadow-md"
                fallbackClassName="flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-md"
                iconClassName="h-8 w-8 text-white"
              />

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Panel gamificado
                </p>
                <h3 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950">
                  {pet.name}
                </h3>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {pet.species}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800">
                    {summary.accumulatedPoints} pts
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700">
                    {summary.unlockedBadges.length} badges
                  </span>
                </div>
              </div>
            </div>

            <CircularScore score={summary.today.finalTotal} max={MAX_DAILY_POINTS} size="md" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] bg-slate-950 px-4 py-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                Racha actual
              </p>
              <p className="mt-2 text-3xl font-black">{summary.generalStreak.current} dias</p>
              <p className={`mt-1 text-sm font-semibold ${streakVisual.tone}`}>
                {streakVisual.emoji || 'Sin fuego aun'}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tracking de hoy
              </p>
              <div className="mt-3 grid gap-2">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Comidas
                    </p>
                    <p className="text-base font-bold text-slate-800">
                      {summary.today.completedMeals}/3
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Agua
                    </p>
                    <p className="text-base font-bold text-slate-800">
                      {currentLog.hydration_ml}ml
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Ejercicio
                    </p>
                    <p className="text-base font-bold text-slate-800">
                      {currentLog.exercise_minutes} min
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Estado general
                    </p>
                    <span className={`text-sm font-bold ${getScoreTone(summary.today.finalTotal)}`}>
                      {summary.today.finalTotal}/{MAX_DAILY_POINTS}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((summary.today.finalTotal / MAX_DAILY_POINTS) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {summary.missingToday.length === 0
                      ? 'Dia completo'
                      : `${summary.missingToday.length} areas pendientes`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Desafio semanal
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {summary.weeklyChallenge.challenge.name}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                {summary.weeklyChallenge.percent}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${summary.weeklyChallenge.percent}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  {summary.consistencyPercentage}% consistencia
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  Mejor racha: {summary.generalStreak.best}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tracking
                </Button>
                <Link href={`/dashboard/${pet.id}`}>
                  <Button variant="secondary" size="sm">
                    Ver ficha
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {summary.missingToday.length > 0 ? (
            <div className="mt-4 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <Target className="h-4 w-4" />
                Falta: {summary.missingToday.slice(0, 3).join(', ')}
                {summary.missingToday.length > 3 ? '...' : ''}
              </div>
            </div>
          ) : null}

          {isModalOpen ? (
            <DailyLogModal
              isOpen={isModalOpen}
              petId={pet.id}
              petName={pet.name}
              logDate={today}
              initialLog={currentLog}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSave}
            />
          ) : null}
        </article>

        {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} /> : null}
      </>
    );
  }

  return (
    <>
      <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <PetPhoto
              name={pet.name}
              photoUrl={pet.photo_url}
              sizeClassName="h-20 w-20 rounded-[1.5rem]"
              imageClassName="object-cover ring-4 ring-amber-100 shadow-lg"
              fallbackClassName="flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
              iconClassName="h-10 w-10 text-white"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Panel gamificado
              </p>
              <NameTag className="mt-2 text-3xl font-black tracking-tight text-slate-950">{pet.name}</NameTag>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {pet.species}
                {pet.breed ? ` · ${pet.breed}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {summary.accumulatedPoints} pts historicos
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {summary.unlockedBadges.length} badges
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <CircularScore score={summary.today.finalTotal} max={MAX_DAILY_POINTS} size={compact ? 'md' : 'lg'} />
            <div className="rounded-[1.4rem] bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Racha actual</p>
              <p className="mt-2 text-3xl font-black">{summary.generalStreak.current} dias</p>
              <p className={`mt-2 text-lg font-semibold ${streakVisual.tone}`}>{streakVisual.emoji || 'Sin fuego aun'}</p>
              <p className="mt-2 text-sm text-slate-300">
                Multiplicador x{summary.today.multiplier.toFixed(summary.today.multiplier % 1 === 0 ? 0 : 2)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_META.map((category) => {
            const value = summary.today[category.key];

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">{category.label}</p>
                  <span className={`text-lg font-black ${getScoreTone(value)}`}>
                    {value}/{category.max}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{category.hint}</p>

                {category.key === 'feeding' ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {summary.today.completedMeals}/3 comidas completadas
                  </p>
                ) : null}
                {category.key === 'hydration' ? (
                  <p className="mt-3 text-sm text-slate-600">{currentLog.hydration_ml}ml registrados</p>
                ) : null}
                {category.key === 'exercise' ? (
                  <p className="mt-3 text-sm text-slate-600">{currentLog.exercise_minutes} min acumulados</p>
                ) : null}
                {category.key === 'health' ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {currentLog.symptoms_severity === 'none'
                      ? 'Sin sintomas'
                      : currentLog.symptoms_severity === 'minor'
                        ? 'Sintomas menores'
                        : 'Sintomas severos'}
                  </p>
                ) : null}
                {category.key === 'care' ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {currentLog.medicines_on_time ? 'Medicinas OK' : 'Medicinas pendientes'} ·{' '}
                    {currentLog.grooming_completed ? 'grooming hecho' : 'sin grooming'}
                  </p>
                ) : null}
                {category.key === 'consistency' ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {Math.round(summary.today.completionRatio * 100)}% del tracking diario
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Desafio semanal
                </p>
                <h4 className="mt-2 text-xl font-black text-slate-950">{summary.weeklyChallenge.challenge.name}</h4>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {summary.weeklyChallenge.challenge.rewardPoints} pts
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {summary.weeklyChallenge.challenge.description}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {getChallengeWindowLabel(summary.weeklyChallenge)} · {summary.weeklyChallenge.remainingDays} dias restantes
            </p>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${summary.weeklyChallenge.percent}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {summary.weeklyChallenge.progress}/{summary.weeklyChallenge.challenge.target}{' '}
              {summary.weeklyChallenge.challenge.unit}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {summary.weeklyChallenge.dailySummary.map((item) => (
                <div key={item.date} className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {item.value}
                    {item.targetValue ? `/${item.targetValue}` : ''}{' '}
                    {summary.weeklyChallenge.challenge.unit}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Logros recientes
                </p>
                <h4 className="text-xl font-black text-slate-950">Badges y hitos</h4>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {summary.unlockedBadges.slice(-3).reverse().map((badge) => (
                <div key={badge.badge.id} className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
                  <p className="text-lg font-bold text-slate-900">
                    {badge.badge.icon} {badge.badge.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{badge.badge.description}</p>
                </div>
              ))}

              {summary.unlockedBadges.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">
                  Aun no hay badges desbloqueados. El primero cae al superar los 25 puntos en un dia.
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {summary.upcomingBadges.map((badge) => (
                <div key={badge.badge.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">
                      {badge.badge.icon} {badge.badge.name}
                    </p>
                    <span className="text-sm font-semibold text-slate-500">
                      {badge.progress}/{badge.target}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{badge.badge.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {!compact ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-amber-300" />
                <h4 className="text-lg font-bold">Rachas especificas</h4>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Alimentacion</p>
                  <p className="mt-1 text-xl font-black">{summary.generalStreak.feeding} dias</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Hidratacion</p>
                  <p className="mt-1 text-xl font-black">{summary.generalStreak.hydration} dias</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Ejercicio</p>
                  <p className="mt-1 text-xl font-black">{summary.generalStreak.exercise} dias</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Medicinas</p>
                  <p className="mt-1 text-xl font-black">{summary.generalStreak.medicine} dias</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {summary.recentMilestones.map((milestone) => (
                  <span key={milestone} className="rounded-full bg-amber-400/20 px-3 py-1 font-semibold text-amber-200">
                    hito {milestone} dias
                  </span>
                ))}
                {summary.recentMilestones.length === 0 ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-slate-200">
                    Sin hitos aun
                  </span>
                ) : null}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Heatmap historico
                  </p>
                  <h4 className="mt-2 text-xl font-black text-slate-950">
                    Ultimos 12 meses
                  </h4>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {formatDateMonthYear(today)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {heatmap.map((cell) => (
                  <div key={cell.date} title={`${cell.date} · ${cell.score} pts`} className={cell.className} />
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Gris sin datos, tonos medios para dias regulares y verde para dias fuertes.
              </p>
            </section>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {summary.consistencyPercentage}% consistencia mensual
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              Mejor racha: {summary.generalStreak.best} dias
            </span>
          </div>

          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Actualizar tracking de hoy
          </Button>
        </div>

        {summary.missingToday.length > 0 ? (
          <div className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4" />
              Falta completar hoy: {summary.missingToday.join(', ')}
            </div>
          </div>
        ) : null}

        {isModalOpen ? (
          <DailyLogModal
            isOpen={isModalOpen}
            petId={pet.id}
            petName={pet.name}
            logDate={today}
            initialLog={currentLog}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        ) : null}
      </article>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={4000} /> : null}
    </>
  );
}
