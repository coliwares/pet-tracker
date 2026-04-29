import { TutorProfile, TutorProfileInput } from './types';

export const TUTOR_PROFILE_LIMITS = {
  fullName: { min: 2, max: 80 },
  phone: { min: 7, max: 25 },
  city: { min: 2, max: 80 },
  address: { min: 5, max: 160 },
  emergencyName: { min: 2, max: 80 },
  emergencyPhone: { min: 7, max: 25 },
  notes: { max: 500 },
} as const;

type TutorProfileValidationResult =
  | { success: true; data: TutorProfileInput }
  | { success: false; error: string };

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function sanitizeOptionalText(value: unknown) {
  const sanitized = sanitizeText(value);
  return sanitized.length > 0 ? sanitized : null;
}

export function validateTutorPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return /^[+\d\s()-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}

function hasValue(value: unknown) {
  return sanitizeText(value).length > 0;
}

export function validateTutorProfileInput(input: Partial<TutorProfileInput>): TutorProfileValidationResult {
  const full_name = sanitizeText(input.full_name);
  const phone = sanitizeText(input.phone);
  const city = sanitizeOptionalText(input.city);
  const address = sanitizeOptionalText(input.address);
  const emergency_contact_name = sanitizeOptionalText(input.emergency_contact_name);
  const emergency_contact_phone = sanitizeOptionalText(input.emergency_contact_phone);
  const notes = sanitizeOptionalText(input.notes);

  if (
    full_name.length < TUTOR_PROFILE_LIMITS.fullName.min ||
    full_name.length > TUTOR_PROFILE_LIMITS.fullName.max
  ) {
    return {
      success: false,
      error: `El nombre debe tener entre ${TUTOR_PROFILE_LIMITS.fullName.min} y ${TUTOR_PROFILE_LIMITS.fullName.max} caracteres.`,
    };
  }

  if (
    phone.length < TUTOR_PROFILE_LIMITS.phone.min ||
    phone.length > TUTOR_PROFILE_LIMITS.phone.max ||
    !validateTutorPhone(phone)
  ) {
    return {
      success: false,
      error: 'Ingresa un teléfono válido con código de país o área.',
    };
  }

  if (
    city &&
    (city.length < TUTOR_PROFILE_LIMITS.city.min || city.length > TUTOR_PROFILE_LIMITS.city.max)
  ) {
    return {
      success: false,
      error: `La ciudad o comuna debe tener entre ${TUTOR_PROFILE_LIMITS.city.min} y ${TUTOR_PROFILE_LIMITS.city.max} caracteres.`,
    };
  }

  if (
    address &&
    (address.length < TUTOR_PROFILE_LIMITS.address.min ||
      address.length > TUTOR_PROFILE_LIMITS.address.max)
  ) {
    return {
      success: false,
      error: `La dirección debe tener entre ${TUTOR_PROFILE_LIMITS.address.min} y ${TUTOR_PROFILE_LIMITS.address.max} caracteres.`,
    };
  }

  if (
    emergency_contact_name &&
    (emergency_contact_name.length < TUTOR_PROFILE_LIMITS.emergencyName.min ||
      emergency_contact_name.length > TUTOR_PROFILE_LIMITS.emergencyName.max)
  ) {
    return {
      success: false,
      error: `El contacto de emergencia debe tener entre ${TUTOR_PROFILE_LIMITS.emergencyName.min} y ${TUTOR_PROFILE_LIMITS.emergencyName.max} caracteres.`,
    };
  }

  if (emergency_contact_name || emergency_contact_phone) {
    if (!emergency_contact_name || !emergency_contact_phone) {
      return {
        success: false,
        error: 'Completa el nombre y teléfono del contacto de emergencia, o deja ambos vacíos.',
      };
    }

    if (
      emergency_contact_phone.length < TUTOR_PROFILE_LIMITS.emergencyPhone.min ||
      emergency_contact_phone.length > TUTOR_PROFILE_LIMITS.emergencyPhone.max ||
      !validateTutorPhone(emergency_contact_phone)
    ) {
      return {
        success: false,
        error: 'El teléfono del contacto de emergencia no es válido.',
      };
    }
  }

  if (notes && notes.length > TUTOR_PROFILE_LIMITS.notes.max) {
    return {
      success: false,
      error: `Las notas no pueden superar los ${TUTOR_PROFILE_LIMITS.notes.max} caracteres.`,
    };
  }

  return {
    success: true,
    data: {
      full_name,
      phone,
      city,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    },
  };
}

export function getTutorProfileCompletionSteps(
  profile:
    | Pick<
        TutorProfile | TutorProfileInput,
        'full_name' | 'phone' | 'emergency_contact_name' | 'emergency_contact_phone'
      >
    | null
) {
  return [
    {
      label: 'Nombre del tutor',
      completed: hasValue(profile?.full_name),
    },
    {
      label: 'Teléfono principal',
      completed: hasValue(profile?.phone),
    },
    {
      label: 'Contacto de emergencia',
      completed: hasValue(profile?.emergency_contact_name) && hasValue(profile?.emergency_contact_phone),
    },
  ];
}
