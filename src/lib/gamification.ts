import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { DailyCareLog, Pet } from './types';
import { cn, parseLocalDate, toDateInputValue } from './utils';

export const MAX_DAILY_POINTS = 55;
export const DAILY_QUALIFYING_POINTS = 28;

export type GamificationTier = 'bronze' | 'silver' | 'gold';

export type StreakMilestone = 3 | 7 | 14 | 30 | 60 | 365;

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  tier: GamificationTier;
  icon: string;
  unlockPoints: number;
  category: 'feeding' | 'hydration' | 'exercise' | 'health' | 'care' | 'consistency';
};

export type BadgeProgress = {
  badge: BadgeDefinition;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  target: number;
};

export type DailyScoreBreakdown = {
  feeding: number;
  hydration: number;
  exercise: number;
  health: number;
  care: number;
  consistency: number;
  baseTotal: number;
  multiplier: number;
  finalTotal: number;
  completionRatio: number;
  completedMeals: number;
};

export type StreakSnapshot = {
  current: number;
  best: number;
  feeding: number;
  hydration: number;
  exercise: number;
  medicine: number;
};

export type WeeklyChallengeDefinition = {
  id: string;
  weekSlot: 0 | 1 | 2 | 3;
  name: string;
  description: string;
  rewardPoints: number;
  rewardLabel: string;
  target: number;
  unit: string;
  difficulty: 'Fácil' | 'Media' | 'Dificil';
};

export type WeeklyChallengeProgress = {
  challenge: WeeklyChallengeDefinition;
  startDate: string;
  endDate: string;
  progress: number;
  percent: number;
  remainingDays: number;
  completed: boolean;
  dailySummary: Array<{
    date: string;
    label: string;
    value: number;
    targetValue?: number;
    status: 'done' | 'warning' | 'pending';
  }>;
};

export type PetGamificationSummary = {
  today: DailyScoreBreakdown;
  currentLog: DailyCareLog;
  generalStreak: StreakSnapshot;
  accumulatedPoints: number;
  unlockedBadges: BadgeProgress[];
  upcomingBadges: BadgeProgress[];
  weeklyChallenge: WeeklyChallengeProgress;
  recentMilestones: StreakMilestone[];
  consistencyPercentage: number;
  missingToday: string[];
};

export type LeaderboardEntry = {
  petId: string;
  petName: string;
  score: number;
  streak: number;
  unlockedBadges: number;
  consistencyPercentage: number;
};

export const DAILY_CARE_DEFAULTS: Omit<DailyCareLog, 'id' | 'pet_id' | 'log_date' | 'created_at' | 'updated_at'> = {
  meals_logged: false,
  breakfast_completed: false,
  lunch_completed: false,
  dinner_completed: false,
  hydration_logged: false,
  hydration_ml: 0,
  exercise_logged: false,
  exercise_minutes: 0,
  health_logged: false,
  symptoms_severity: 'none',
  care_logged: false,
  medicines_on_time: false,
  grooming_completed: false,
  ears_eyes_cleaning_completed: false,
  notes: null,
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'caregiver-novice',
    name: 'Cuidador Novato',
    description: 'Completa tu primer dia con al menos 25 puntos.',
    tier: 'bronze',
    icon: '🥉',
    unlockPoints: 0,
    category: 'consistency',
  },
  {
    id: 'feeding-consistent',
    name: 'Alimentador Consistente',
    description: 'Consigue 7 dias seguidos con 3/3 comidas.',
    tier: 'bronze',
    icon: '🍽️',
    unlockPoints: 50,
    category: 'feeding',
  },
  {
    id: 'hydration-watch',
    name: 'Hidratador Vigilante',
    description: 'Registra 1500ml o mas durante 5 dias seguidos.',
    tier: 'bronze',
    icon: '💧',
    unlockPoints: 30,
    category: 'hydration',
  },
  {
    id: 'exercise-starter',
    name: 'Entrenador Principiante',
    description: 'Acumula 50 minutos de ejercicio.',
    tier: 'bronze',
    icon: '🐾',
    unlockPoints: 40,
    category: 'exercise',
  },
  {
    id: 'exercise-athlete',
    name: 'Entrenador Deportista',
    description: 'Mantiene 30 dias seguidos con 30+ minutos de ejercicio.',
    tier: 'silver',
    icon: '🥈',
    unlockPoints: 100,
    category: 'exercise',
  },
  {
    id: 'preventive-doctor',
    name: 'Doctor Preventivo',
    description: 'Logra 14 dias seguidos sin sintomas.',
    tier: 'silver',
    icon: '🩺',
    unlockPoints: 120,
    category: 'health',
  },
  {
    id: 'grooming-pro',
    name: 'Cepillista Pro',
    description: 'Completa 10 sesiones de grooming.',
    tier: 'silver',
    icon: '🪮',
    unlockPoints: 90,
    category: 'care',
  },
  {
    id: 'perfect-logger',
    name: 'Registrador Obsesivo',
    description: 'Mantiene 7 dias con el 100% del tracking diario.',
    tier: 'silver',
    icon: '📒',
    unlockPoints: 110,
    category: 'consistency',
  },
  {
    id: 'weekend-active',
    name: 'Fin de Semana Activo',
    description: 'Completa 30+ minutos en sabado y domingo.',
    tier: 'silver',
    icon: '📅',
    unlockPoints: 80,
    category: 'exercise',
  },
  {
    id: 'care-champion',
    name: 'Campeon del Cuidado',
    description: 'Consigue un dia perfecto de 55/55 puntos.',
    tier: 'gold',
    icon: '👑',
    unlockPoints: 300,
    category: 'consistency',
  },
  {
    id: 'personal-vet',
    name: 'Veterinario Personal',
    description: 'Mantiene 30 dias sin sintomas criticos.',
    tier: 'gold',
    icon: '🏥',
    unlockPoints: 320,
    category: 'health',
  },
  {
    id: 'wellness-master',
    name: 'Maestro del Bienestar',
    description: 'Logra 7 dias seguidos con todas las categorias al maximo.',
    tier: 'gold',
    icon: '🏆',
    unlockPoints: 350,
    category: 'consistency',
  },
  {
    id: 'golden-month',
    name: 'Mes Dorado',
    description: 'Mantiene una racha general de 30 dias.',
    tier: 'gold',
    icon: '🥇',
    unlockPoints: 400,
    category: 'consistency',
  },
  {
    id: 'care-legend',
    name: 'Leyenda del Cuidado',
    description: 'Acumula 1000 puntos historicos.',
    tier: 'gold',
    icon: '⭐',
    unlockPoints: 500,
    category: 'consistency',
  },
];

export const WEEKLY_CHALLENGES: WeeklyChallengeDefinition[] = [
  {
    id: 'active-tail',
    weekSlot: 0,
    name: 'Mes Activo',
    description: 'Acumula al menos 100 minutos de ejercicio esta semana.',
    rewardPoints: 50,
    rewardLabel: 'Badge Entrenador Semanal',
    target: 100,
    unit: 'min',
    difficulty: 'Media',
  },
  {
    id: 'perfect-nutrition',
    weekSlot: 1,
    name: 'Nutricion Perfecta',
    description: 'Completa todas las comidas sin saltarte ninguna.',
    rewardPoints: 40,
    rewardLabel: 'Descuento veterinario virtual 5%',
    target: 21,
    unit: 'comidas',
    difficulty: 'Fácil',
  },
  {
    id: 'full-grooming',
    weekSlot: 2,
    name: 'Higiene Completa',
    description: 'Realiza 3 sesiones de cuidado esta semana.',
    rewardPoints: 35,
    rewardLabel: 'Cosmetico pet virtual',
    target: 3,
    unit: 'sesiones',
    difficulty: 'Media',
  },
  {
    id: 'pure-health',
    weekSlot: 3,
    name: 'Salud Impecable',
    description: 'Mantiene 7 dias sin sintomas y con medicinas a tiempo.',
    rewardPoints: 60,
    rewardLabel: 'Trophy Salud Pura',
    target: 7,
    unit: 'dias',
    difficulty: 'Dificil',
  },
];

export function createEmptyDailyCareLog(petId: string, logDate: string): DailyCareLog {
  return {
    id: `draft:${petId}:${logDate}`,
    pet_id: petId,
    log_date: logDate,
    created_at: '',
    updated_at: '',
    ...DAILY_CARE_DEFAULTS,
  };
}

export function mergeDailyCareLog(
  petId: string,
  logDate: string,
  log?: Partial<DailyCareLog> | null
): DailyCareLog {
  return {
    ...createEmptyDailyCareLog(petId, logDate),
    ...(log ?? {}),
    pet_id: petId,
    log_date: logDate,
  };
}

export function calculateDailyScore(log: DailyCareLog, streakForMultiplier = 1): DailyScoreBreakdown {
  const completedMeals =
    Number(log.breakfast_completed) + Number(log.lunch_completed) + Number(log.dinner_completed);
  const feeding = completedMeals * 3 + (completedMeals === 3 ? 1 : 0);
  const hydration =
    log.hydration_ml >= 2000 ? 5 : log.hydration_ml >= 1500 ? 3 : log.hydration_ml > 0 ? 1 : 0;
  const exercise = log.exercise_minutes >= 30 ? 15 : log.exercise_minutes >= 15 ? 8 : 0;
  const health = log.symptoms_severity === 'none' ? 10 : log.symptoms_severity === 'minor' ? 5 : 0;
  const care = Math.min(
    10,
    (log.medicines_on_time ? 5 : 0) +
      (log.grooming_completed ? 3 : 0) +
      (log.ears_eyes_cleaning_completed ? 2 : 0)
  );
  const trackedAreas = [
    log.meals_logged,
    log.hydration_logged,
    log.exercise_logged,
    log.health_logged,
    log.care_logged,
  ].filter(Boolean).length;
  const completionRatio = trackedAreas / 5;
  const consistency = completionRatio >= 0.8 ? 5 : 0;
  const baseTotal = feeding + hydration + exercise + health + care + consistency;
  const multiplier = getConsistencyMultiplier(streakForMultiplier);
  const finalTotal = Math.round(baseTotal * multiplier);

  return {
    feeding,
    hydration,
    exercise,
    health,
    care,
    consistency,
    baseTotal,
    multiplier,
    finalTotal,
    completionRatio,
    completedMeals,
  };
}

export function getConsistencyMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2;
  if (streakDays >= 15) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1;
}

export function getStreakVisual(current: number) {
  const count = current >= 30 ? 5 : current >= 15 ? 4 : current >= 8 ? 3 : current >= 4 ? 2 : current >= 1 ? 1 : 0;
  const tone =
    current >= 30
      ? 'text-rose-700'
      : current >= 15
        ? 'text-rose-600'
        : current >= 8
          ? 'text-orange-600'
          : 'text-amber-500';

  return {
    emoji: `${'🔥'.repeat(count)}${current >= 30 ? '⭐' : ''}`,
    tone,
  };
}

type TimelineEntry = {
  date: string;
  score: DailyScoreBreakdown;
  generalStreak: number;
};

function buildScoreTimeline(logs: DailyCareLog[]): TimelineEntry[] {
  const sortedLogs = [...logs].sort(
    (a, b) => parseLocalDate(a.log_date).getTime() - parseLocalDate(b.log_date).getTime()
  );
  let currentStreak = 0;

  return sortedLogs.map((log, index) => {
    const previous = sortedLogs[index - 1];
    const scoreWithoutMultiplier = calculateDailyScore(log, 1);
    const isConsecutive =
      previous &&
      differenceInCalendarDays(parseLocalDate(log.log_date), parseLocalDate(previous.log_date)) === 1;
    const qualifies = scoreWithoutMultiplier.baseTotal >= DAILY_QUALIFYING_POINTS;

    if (qualifies) {
      currentStreak = isConsecutive || index === 0 ? currentStreak + 1 : 1;
    } else {
      currentStreak = 0;
    }

    return {
      date: log.log_date,
      score: calculateDailyScore(log, currentStreak || 1),
      generalStreak: currentStreak,
    };
  });
}

function computeBestStreak(values: boolean[]): number {
  let best = 0;
  let current = 0;

  for (const value of values) {
    if (value) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

function computeTrailingStreak(logs: DailyCareLog[], predicate: (log: DailyCareLog) => boolean): number {
  const sortedLogs = [...logs].sort(
    (a, b) => parseLocalDate(a.log_date).getTime() - parseLocalDate(b.log_date).getTime()
  );
  let streak = 0;

  for (let index = sortedLogs.length - 1; index >= 0; index -= 1) {
    const current = sortedLogs[index];
    const previous = sortedLogs[index - 1];

    if (!predicate(current)) {
      break;
    }

    if (!previous) {
      streak += 1;
      break;
    }

    if (differenceInCalendarDays(parseLocalDate(current.log_date), parseLocalDate(previous.log_date)) !== 1) {
      streak += 1;
      break;
    }

    streak += 1;
  }

  return streak;
}

function computeRecentMilestones(currentStreak: number): StreakMilestone[] {
  return ([3, 7, 14, 30, 60, 365] as StreakMilestone[]).filter((milestone) => currentStreak >= milestone);
}

function getActiveWeeklyChallenge(referenceDate: Date = new Date()): WeeklyChallengeDefinition {
  const yearStart = new Date(referenceDate.getFullYear(), 0, 1);
  const weeksSinceYearStart = Math.floor(
    differenceInCalendarDays(startOfWeek(referenceDate, { weekStartsOn: 1 }), startOfWeek(yearStart, { weekStartsOn: 1 })) / 7
  );
  const slot = ((weeksSinceYearStart % 4) + 4) % 4 as 0 | 1 | 2 | 3;

  return WEEKLY_CHALLENGES.find((challenge) => challenge.weekSlot === slot) ?? WEEKLY_CHALLENGES[0];
}

export function buildWeeklyChallengeProgress(
  logs: DailyCareLog[],
  referenceDate: Date = new Date()
): WeeklyChallengeProgress {
  const challenge = getActiveWeeklyChallenge(referenceDate);
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekLogs = logs.filter((log) =>
    isWithinInterval(parseLocalDate(log.log_date), { start: weekStart, end: weekEnd })
  );

  let progress = 0;

  if (challenge.id === 'active-tail') {
    progress = weekLogs.reduce((total, log) => total + log.exercise_minutes, 0);
  }

  if (challenge.id === 'perfect-nutrition') {
    progress = weekLogs.reduce(
      (total, log) =>
        total + Number(log.breakfast_completed) + Number(log.lunch_completed) + Number(log.dinner_completed),
      0
    );
  }

  if (challenge.id === 'full-grooming') {
    progress = weekLogs.reduce(
      (total, log) => total + Number(log.grooming_completed) + Number(log.ears_eyes_cleaning_completed),
      0
    );
  }

  if (challenge.id === 'pure-health') {
    progress = weekLogs.reduce(
      (total, log) =>
        total + Number(log.symptoms_severity === 'none' && (!log.care_logged || log.medicines_on_time)),
      0
    );
  }

  const dailySummary = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => {
    const dayLabel = format(day, 'EEE', { locale: es });
    const dayLog = weekLogs.find((log) => isSameDay(parseLocalDate(log.log_date), day));
    let value = 0;
    let targetValue: number | undefined;

    if (challenge.id === 'active-tail') {
      value = dayLog?.exercise_minutes ?? 0;
      targetValue = 15;
    }

    if (challenge.id === 'perfect-nutrition') {
      value =
        (dayLog ? Number(dayLog.breakfast_completed) + Number(dayLog.lunch_completed) + Number(dayLog.dinner_completed) : 0);
      targetValue = 3;
    }

    if (challenge.id === 'full-grooming') {
      value = dayLog ? Number(dayLog.grooming_completed) + Number(dayLog.ears_eyes_cleaning_completed) : 0;
      targetValue = 1;
    }

    if (challenge.id === 'pure-health') {
      value = dayLog && dayLog.symptoms_severity === 'none' && (!dayLog.care_logged || dayLog.medicines_on_time) ? 1 : 0;
      targetValue = 1;
    }

    return {
      date: toDateInputValue(day),
      label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      value,
      targetValue,
      status:
        !dayLog && day > referenceDate
          ? 'pending'
          : targetValue !== undefined && value >= targetValue
            ? 'done'
            : !dayLog && day <= referenceDate
              ? 'warning'
              : value > 0
                ? 'warning'
                : 'pending',
    } as WeeklyChallengeProgress['dailySummary'][number];
  });

  return {
    challenge,
    startDate: toDateInputValue(weekStart),
    endDate: toDateInputValue(weekEnd),
    progress,
    percent: Math.min(100, Math.round((progress / challenge.target) * 100)),
    remainingDays: Math.max(0, differenceInCalendarDays(weekEnd, referenceDate)),
    completed: progress >= challenge.target,
    dailySummary,
  };
}

export function evaluateBadges(logs: DailyCareLog[]): BadgeProgress[] {
  const timeline = buildScoreTimeline(logs);
  const totalPoints = timeline.reduce((total, entry) => total + entry.score.finalTotal, 0);
  const sortedLogs = [...logs].sort(
    (a, b) => parseLocalDate(a.log_date).getTime() - parseLocalDate(b.log_date).getTime()
  );

  return BADGE_DEFINITIONS.map((badge) => {
    let unlocked = false;
    let unlockedAt: string | null = null;
    let progress = 0;
    let target = 1;

    switch (badge.id) {
      case 'caregiver-novice': {
        target = 25;
        const first = timeline.find((entry) => entry.score.baseTotal >= target);
        progress = Math.min(target, Math.max(0, ...timeline.map((entry) => entry.score.baseTotal), 0));
        unlocked = Boolean(first);
        unlockedAt = first?.date ?? null;
        break;
      }
      case 'feeding-consistent': {
        target = 7;
        progress = computeBestStreak(sortedLogs.map((log) => calculateDailyScore(log, 1).completedMeals === 3));
        unlocked = progress >= target;
        break;
      }
      case 'hydration-watch': {
        target = 5;
        progress = computeBestStreak(sortedLogs.map((log) => log.hydration_ml >= 1500));
        unlocked = progress >= target;
        break;
      }
      case 'exercise-starter': {
        target = 50;
        progress = sortedLogs.reduce((total, log) => total + log.exercise_minutes, 0);
        unlocked = progress >= target;
        break;
      }
      case 'exercise-athlete': {
        target = 30;
        progress = computeBestStreak(sortedLogs.map((log) => log.exercise_minutes >= 30));
        unlocked = progress >= target;
        break;
      }
      case 'preventive-doctor': {
        target = 14;
        progress = computeBestStreak(sortedLogs.map((log) => log.symptoms_severity === 'none'));
        unlocked = progress >= target;
        break;
      }
      case 'grooming-pro': {
        target = 10;
        progress = sortedLogs.reduce((total, log) => total + Number(log.grooming_completed), 0);
        unlocked = progress >= target;
        break;
      }
      case 'perfect-logger': {
        target = 7;
        progress = computeBestStreak(sortedLogs.map((log) => calculateDailyScore(log, 1).completionRatio === 1));
        unlocked = progress >= target;
        break;
      }
      case 'weekend-active': {
        target = 2;
        let found = false;
        for (let index = 0; index < sortedLogs.length - 1; index += 1) {
          const saturday = sortedLogs[index];
          const sunday = sortedLogs[index + 1];
          const saturdayDate = parseLocalDate(saturday.log_date);
          const sundayDate = parseLocalDate(sunday.log_date);

          if (
            saturdayDate.getDay() === 6 &&
            sundayDate.getDay() === 0 &&
            differenceInCalendarDays(sundayDate, saturdayDate) === 1 &&
            saturday.exercise_minutes >= 30 &&
            sunday.exercise_minutes >= 30
          ) {
            found = true;
            break;
          }
        }
        progress = found ? target : 0;
        unlocked = found;
        break;
      }
      case 'care-champion': {
        target = MAX_DAILY_POINTS;
        progress = Math.max(0, ...timeline.map((entry) => entry.score.baseTotal), 0);
        unlocked = progress >= target;
        break;
      }
      case 'personal-vet': {
        target = 30;
        progress = computeBestStreak(sortedLogs.map((log) => log.symptoms_severity !== 'severe'));
        unlocked = progress >= target;
        break;
      }
      case 'wellness-master': {
        target = 7;
        progress = computeBestStreak(sortedLogs.map((log) => calculateDailyScore(log, 1).baseTotal === MAX_DAILY_POINTS));
        unlocked = progress >= target;
        break;
      }
      case 'golden-month': {
        target = 30;
        progress = Math.max(0, ...timeline.map((entry) => entry.generalStreak), 0);
        unlocked = progress >= target;
        break;
      }
      case 'care-legend': {
        target = 1000;
        progress = totalPoints;
        unlocked = progress >= target;
        break;
      }
      default:
        break;
    }

    if (!unlockedAt && unlocked) {
      unlockedAt = sortedLogs.at(-1)?.log_date ?? null;
    }

    return {
      badge,
      unlocked,
      unlockedAt,
      progress: Math.min(progress, target),
      target,
    };
  });
}

export function buildPetGamificationSummary(
  petId: string,
  logs: DailyCareLog[],
  referenceDate: Date = new Date()
): PetGamificationSummary {
  const today = toDateInputValue(referenceDate);
  const todayLog = mergeDailyCareLog(petId, today, logs.find((log) => log.log_date === today));
  const timeline = buildScoreTimeline(logs);
  const todayTimeline = timeline.find((entry) => entry.date === today);
  const currentGeneralStreak = todayTimeline?.generalStreak ?? computeTrailingStreak(logs, (log) => calculateDailyScore(log, 1).baseTotal >= DAILY_QUALIFYING_POINTS);
  const generalStreakValues = timeline.map((entry) => entry.generalStreak);
  const unlockedBadges = evaluateBadges(logs);
  const todayScore = calculateDailyScore(todayLog, currentGeneralStreak || 1);
  const missingToday = [
    !todayLog.meals_logged ? 'Alimentacion' : null,
    !todayLog.hydration_logged ? 'Hidratacion' : null,
    !todayLog.exercise_logged ? 'Ejercicio' : null,
    !todayLog.health_logged ? 'Salud' : null,
    !todayLog.care_logged ? 'Cuidados' : null,
  ].filter(Boolean) as string[];
  const trackedMonthLogs = logs.filter((log) =>
    isWithinInterval(parseLocalDate(log.log_date), {
      start: startOfMonth(referenceDate),
      end: endOfMonth(referenceDate),
    })
  );

  return {
    today: todayScore,
    currentLog: todayLog,
    generalStreak: {
      current: currentGeneralStreak,
      best: Math.max(0, ...generalStreakValues, 0),
      feeding: computeTrailingStreak(logs, (log) => calculateDailyScore(log, 1).completedMeals === 3),
      hydration: computeTrailingStreak(logs, (log) => log.hydration_ml >= 1500),
      exercise: computeTrailingStreak(logs, (log) => log.exercise_minutes >= 30),
      medicine: computeTrailingStreak(logs, (log) => !log.care_logged || log.medicines_on_time),
    },
    accumulatedPoints: timeline.reduce((total, entry) => total + entry.score.finalTotal, 0),
    unlockedBadges: unlockedBadges.filter((badge) => badge.unlocked),
    upcomingBadges: unlockedBadges.filter((badge) => !badge.unlocked).sort((a, b) => a.target - a.progress - (b.target - b.progress)).slice(0, 3),
    weeklyChallenge: buildWeeklyChallengeProgress(logs, referenceDate),
    recentMilestones: computeRecentMilestones(currentGeneralStreak),
    consistencyPercentage:
      trackedMonthLogs.length === 0
        ? 0
        : Math.round(
            (trackedMonthLogs.filter((log) => calculateDailyScore(log, 1).baseTotal >= DAILY_QUALIFYING_POINTS).length /
              trackedMonthLogs.length) *
              100
          ),
    missingToday,
  };
}

export function buildWeeklyLeaderboard(
  pets: Pet[],
  logsByPetId: Record<string, DailyCareLog[]>,
  referenceDate: Date = new Date()
): LeaderboardEntry[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return pets
    .map((pet) => {
      const petLogs = logsByPetId[pet.id] ?? [];
      const weeklyLogs = petLogs.filter((log) =>
        isWithinInterval(parseLocalDate(log.log_date), { start: weekStart, end: weekEnd })
      );
      const summary = buildPetGamificationSummary(pet.id, petLogs, referenceDate);

      return {
        petId: pet.id,
        petName: pet.name,
        score: buildScoreTimeline(weeklyLogs).reduce((total, entry) => total + entry.score.finalTotal, 0),
        streak: summary.generalStreak.current,
        unlockedBadges: summary.unlockedBadges.filter((badge) => badge.unlockedAt && isWithinInterval(parseLocalDate(badge.unlockedAt), { start: weekStart, end: weekEnd })).length,
        consistencyPercentage: summary.consistencyPercentage,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getLeaderboardPosition(entries: LeaderboardEntry[], petId: string): number | null {
  const index = entries.findIndex((entry) => entry.petId === petId);
  return index === -1 ? null : index + 1;
}

export function getScoreTone(score: number): string {
  if (score >= 44) return 'text-emerald-600';
  if (score >= 33) return 'text-amber-500';
  if (score >= 22) return 'text-orange-500';
  return 'text-rose-600';
}

export function getScoreSurface(score: number): string {
  if (score >= 44) return 'from-emerald-500 to-teal-500';
  if (score >= 33) return 'from-amber-400 to-orange-400';
  if (score >= 22) return 'from-orange-400 to-rose-400';
  return 'from-rose-500 to-pink-500';
}

export function getChallengeWindowLabel(progress: WeeklyChallengeProgress): string {
  return `${format(parseLocalDate(progress.startDate), 'd MMM', { locale: es })} al ${format(parseLocalDate(progress.endDate), 'd MMM', { locale: es })}`;
}

export function getDailyHeatmapColor(score: number): string {
  if (score >= 40) return 'bg-emerald-500';
  if (score >= 25) return 'bg-amber-400';
  if (score > 0) return 'bg-orange-400';
  return 'bg-slate-200';
}

export function buildMonthlyHeatmap(logs: DailyCareLog[], referenceDate: Date = new Date()) {
  const start = addDays(referenceDate, -364);
  return eachDayOfInterval({ start, end: referenceDate }).map((day) => {
    const date = toDateInputValue(day);
    const log = logs.find((entry) => entry.log_date === date);
    const score = log ? calculateDailyScore(log, 1).baseTotal : 0;

    return {
      date,
      score,
      className: cn('h-3 w-3 rounded-[4px]', getDailyHeatmapColor(score)),
    };
  });
}
