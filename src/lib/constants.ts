import { Species } from './types';

export const SPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'] as const;

export const EVENT_TYPES = ['vacuna', 'visita', 'medicina', 'otro'] as const;

export const EVENT_TYPE_LABELS = {
  vacuna: 'Vacuna',
  visita: 'Visita Veterinaria',
  medicina: 'Medicina',
  otro: 'Otro',
} as const;

export type EventDueRule = {
  amount: number;
  unit: 'days' | 'months' | 'years';
};

export type EventCatalogItem = {
  title: string;
  nextDueRule?: EventDueRule;
  historyGroup?: string;
  species?: Species[];
  maxAgeMonths?: number;
  minAgeMonths?: number;
};

export const EVENT_CATALOG: Record<typeof EVENT_TYPES[number], readonly EventCatalogItem[]> = {
  vacuna: [
    {
      title: 'Vacuna multiple cachorro - 1ra dosis',
      nextDueRule: { amount: 21, unit: 'days' },
      historyGroup: 'vacuna_multiple_cachorro',
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna multiple cachorro - 2da dosis',
      nextDueRule: { amount: 21, unit: 'days' },
      historyGroup: 'vacuna_multiple_cachorro',
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna multiple cachorro - 3ra dosis',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_multiple_cachorro',
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna antirrabica cachorro',
      nextDueRule: { amount: 1, unit: 'years' },
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Desparasitacion cachorro',
      nextDueRule: { amount: 1, unit: 'months' },
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna multiple anual',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_multiple_anual',
      species: ['Perro'],
      minAgeMonths: 12,
    },
    {
      title: 'Vacuna antirrabica anual',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_antirrabica_anual_perro',
      species: ['Perro'],
      minAgeMonths: 12,
    },
    {
      title: 'Desparasitacion adulto',
      nextDueRule: { amount: 3, unit: 'months' },
      species: ['Perro', 'Gato'],
      minAgeMonths: 12,
    },
    {
      title: 'Vacuna triple felina gatito - 1ra dosis',
      nextDueRule: { amount: 21, unit: 'days' },
      historyGroup: 'vacuna_triple_felina_gatito',
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna triple felina gatito - 2da dosis',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_triple_felina_gatito',
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna leucemia felina - 1ra dosis',
      nextDueRule: { amount: 21, unit: 'days' },
      historyGroup: 'vacuna_leucemia_felina',
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna leucemia felina - 2da dosis',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_leucemia_felina',
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Desparasitacion gatito',
      nextDueRule: { amount: 1, unit: 'months' },
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Vacuna triple felina anual',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_triple_felina_anual',
      species: ['Gato'],
      minAgeMonths: 12,
    },
    {
      title: 'Vacuna leucemia felina anual',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_leucemia_felina_anual',
      species: ['Gato'],
      minAgeMonths: 12,
    },
    {
      title: 'Vacuna antirrabica anual felina',
      nextDueRule: { amount: 1, unit: 'years' },
      historyGroup: 'vacuna_antirrabica_anual_gato',
      species: ['Gato'],
      minAgeMonths: 12,
    },
    {
      title: 'Vacuna anual',
      nextDueRule: { amount: 1, unit: 'years' },
      species: ['Conejo', 'Ave', 'Otro'],
    },
    {
      title: 'Desparasitacion',
      nextDueRule: { amount: 3, unit: 'months' },
      species: ['Conejo', 'Ave', 'Otro'],
    },
  ],
  visita: [
    {
      title: 'Control de cachorro',
      nextDueRule: { amount: 1, unit: 'months' },
      species: ['Perro'],
      maxAgeMonths: 11,
    },
    {
      title: 'Control de gatito',
      nextDueRule: { amount: 1, unit: 'months' },
      species: ['Gato'],
      maxAgeMonths: 11,
    },
    {
      title: 'Control anual',
      nextDueRule: { amount: 1, unit: 'years' },
    },
    {
      title: 'Consulta veterinaria',
    },
    {
      title: 'Urgencia',
    },
    {
      title: 'Control postoperatorio',
      nextDueRule: { amount: 7, unit: 'days' },
    },
  ],
  medicina: [
    {
      title: 'Inicio de tratamiento',
    },
    {
      title: 'Control de tratamiento',
      nextDueRule: { amount: 7, unit: 'days' },
    },
    {
      title: 'Antibiotico',
    },
    {
      title: 'Antiinflamatorio',
    },
    {
      title: 'Vitaminas o suplemento',
      nextDueRule: { amount: 1, unit: 'months' },
    },
  ],
  otro: [],
} as const;

export const EVENT_TYPE_COLORS = {
  vacuna: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200',
  visita: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-2 border-emerald-200',
  medicina: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-2 border-orange-200',
  otro: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-2 border-gray-200',
} as const;

export const EVENT_TYPE_ICON_COLORS = {
  vacuna: 'text-blue-600 bg-blue-100',
  visita: 'text-emerald-600 bg-emerald-100',
  medicina: 'text-orange-600 bg-orange-100',
  otro: 'text-gray-600 bg-gray-100',
} as const;

export const FEEDBACK_TYPES = ['bug', 'mejora'] as const;

export const FEEDBACK_TYPE_LABELS = {
  bug: 'Bug',
  mejora: 'Mejora',
} as const;

export const FEEDBACK_TYPE_COLORS = {
  bug: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-2 border-rose-200',
  mejora: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-2 border-blue-200',
} as const;

export const FEEDBACK_STATUSES = ['nuevo', 'en_revision', 'resuelto'] as const;

export const FEEDBACK_STATUS_LABELS = {
  nuevo: 'Nuevo',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
} as const;

export const FEEDBACK_STATUS_COLORS = {
  nuevo: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-2 border-amber-200',
  en_revision: 'bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 border-2 border-violet-200',
  resuelto: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-2 border-emerald-200',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
