export const SPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'] as const;

export const EVENT_TYPES = ['vacuna', 'visita', 'medicina', 'otro'] as const;

export const EVENT_TYPE_LABELS = {
  vacuna: 'Vacuna',
  visita: 'Visita Veterinaria',
  medicina: 'Medicina',
  otro: 'Otro',
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
