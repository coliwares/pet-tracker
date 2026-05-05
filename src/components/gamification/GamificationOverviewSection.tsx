'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Crown, Flame, Medal, Trophy } from 'lucide-react';
import { useDailyCareLogsByPets } from '@/hooks/useDailyCareLogs';
import { buildWeeklyLeaderboard, getLeaderboardPosition, getStreakVisual } from '@/lib/gamification';
import { Pet } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

type GamificationOverviewSectionProps = {
  pets: Pet[];
};

export function GamificationOverviewSection({ pets }: GamificationOverviewSectionProps) {
  const petIds = useMemo(() => pets.map((pet) => pet.id), [pets]);
  const { logsByPetId, loading } = useDailyCareLogsByPets(petIds);
  const leaderboard = buildWeeklyLeaderboard(pets, logsByPetId);
  const activePet = pets[0];
  const activePosition = activePet ? getLeaderboardPosition(leaderboard, activePet.id) : null;

  if (pets.length === 0) {
    return null;
  }

  return (
    <section id="gamificacion" className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Gamificacion
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Ranking semanal (en progreso solo para betatester)
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Comparamos progreso, rachas y consistencia entre tus mascotas para empujar habitos
            sostenidos sin salir del dashboard.
          </p>
        </div>

        <Link href={activePet ? `/dashboard/${activePet.id}` : '/dashboard'}>
          <Button variant="secondary" size="sm">
            <Trophy className="mr-2 h-4 w-4" />
            Ver detalle gamificado
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="mt-6">
          <Loading text="Calculando leaderboard..." />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-300" />
              <h3 className="text-xl font-black">Top semanal</h3>
            </div>

            <div className="mt-5 space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => {
                const streak = getStreakVisual(entry.streak);

                return (
                  <div
                    key={entry.petId}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-amber-200">{index + 1}</span>
                      <div>
                        <p className="font-semibold text-white">{entry.petName}</p>
                        <p className="text-sm text-slate-300">
                          {entry.unlockedBadges} badges · {entry.consistencyPercentage}% consistencia
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white">{entry.score} pts</p>
                      <p className={`text-sm font-semibold ${streak.tone}`}>{streak.emoji || 'Sin racha'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 p-5">
              <div className="rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
                <Medal className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
                Tu posicion
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {activePosition ? `#${activePosition}` : 'Sin puesto'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Basada en la primera mascota visible del dashboard.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 p-5">
              <div className="rounded-2xl bg-white p-3 text-rose-700 shadow-sm">
                <Flame className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-rose-800">
                Mejor racha
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {leaderboard[0]?.streak ?? 0} dias
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {leaderboard[0] ? `${leaderboard[0].petName} lidera esta semana.` : 'Sin datos suficientes aun.'}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 p-5">
              <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                <Trophy className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
                Puntaje top
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {leaderboard[0]?.score ?? 0}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Suma de puntos finales entre lunes y domingo.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
