'use client';

import { MAX_DAILY_POINTS, getScoreSurface, getScoreTone } from '@/lib/gamification';

type CircularScoreProps = {
  score: number;
  max?: number;
  label?: string;
  size?: 'md' | 'lg';
};

export function CircularScore({
  score,
  max = MAX_DAILY_POINTS,
  label = 'puntos hoy',
  size = 'md',
}: CircularScoreProps) {
  const percent = Math.min(100, Math.round((score / max) * 100));
  const dimension = size === 'lg' ? 156 : 124;
  const ring = `conic-gradient(from 0deg, var(--score-fill) ${percent}%, rgba(226,232,240,0.9) ${percent}% 100%)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-full p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
        style={
          {
            width: dimension,
            height: dimension,
            backgroundImage: ring,
            ['--score-fill' as string]: percent >= 80
              ? '#10b981'
              : percent >= 60
                ? '#f59e0b'
                : percent >= 40
                  ? '#f97316'
                  : '#f43f5e',
          } as React.CSSProperties
        }
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
          <span className={`text-3xl font-black ${getScoreTone(score)}`}>{score}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            / {max}
          </span>
        </div>
      </div>
      <div className={`rounded-full bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white ${getScoreSurface(score)}`}>
        {score}/{max} {label}
      </div>
    </div>
  );
}
