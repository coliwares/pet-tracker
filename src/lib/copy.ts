export const loginPageCopy = {
  title: 'Bienvenido de vuelta',
  subtitle: 'Ingresa a tu cuenta para gestionar tus mascotas',
  signupPrompt: '¿No tienes cuenta?',
  signupCta: 'Regístrate gratis',
} as const;

export const homeCopy = {
  trustPoints: [
    'Acceso inmediato a la demo',
    'Pensado para uso diario en consulta',
    'Hecho para familias con varias mascotas',
  ],
  testimonials: [
    {
      quote:
        'Antes llevaba fotos, papeles y mensajes sueltos. Ahora llego al vet con todo ordenado en el teléfono.',
      author: 'Camila, tutora de Nala',
    },
    {
      quote:
        'Lo que más me sirve es tener vacunas y controles en la misma vista. Me ahorra tiempo cada mes.',
      author: 'Diego, tutor de Moka y Bruno',
    },
  ],
  loggedInHero: {
    eyebrow: 'Tu carnet está listo',
    title: 'Bienvenido de vuelta a tu panel de mascotas',
    description:
      'Entra a tu dashboard para revisar historiales, agregar eventos médicos y mantener todo al día.',
    primaryCta: 'Ir al dashboard',
    secondaryCta: 'Ver feedback',
  },
  landingHero: {
    badge: 'Historial veterinario simple, claro y siempre contigo',
    title: 'Toda la salud de tu mascota en un solo lugar.',
    description:
      'Organiza vacunas, controles y tratamientos en un carnet digital fácil de mostrar cuando lo necesites.',
    primaryCta: 'Probar demo',
    secondaryCta: 'Ingresar ahora',
    noticeTitle: 'Registro temporalmente cerrado',
    noticeBody:
      'Mientras reabrimos nuevas cuentas, puedes explorar la experiencia con la demo o entrar si ya tienes acceso.',
  },
  previewCard: {
    eyebrow: 'Panel de mascota',
    petName: 'Luna, 4 años',
    statusBadge: 'Carnet activo',
    lastCheckupLabel: 'Último control',
    lastCheckupValue: '12 Abril',
    nextVaccineLabel: 'Próxima vacuna',
    nextVaccineValue: '26 Abril',
    healthStatusLabel: 'Estado',
    healthStatusValue: 'Al día',
    quickAccessEyebrow: 'Acceso rápido',
    quickAccessTitle: 'Abre el historial desde tu teléfono antes de la consulta.',
    quickAccessBadge: 'QR listo',
    timelineItems: [
      ['Vacuna antirrábica', 'Próxima dosis en 8 días'],
      ['Control anual', 'Resumen clínico listo para compartir'],
      ['Tratamiento digestivo', 'Historial actualizado'],
    ],
  },
  benefits: {
    eyebrow: 'Por qué funciona',
    title: 'Menos papeles, menos dudas, mejor seguimiento.',
    description:
      'Diseñado para que cualquier tutor encuentre la información clave en segundos, incluso desde el celular.',
    cards: [
      {
        title: 'Historial claro y ordenado',
        description: 'Vacunas, controles y tratamientos en una línea de tiempo fácil de revisar.',
      },
      {
        title: 'Recordatorios útiles',
        description: 'Mantente atento a próximas dosis y visitas sin depender de notas sueltas.',
      },
      {
        title: 'Comparte con tu veterinario',
        description: 'Prepara el contexto clínico de tu mascota antes de cada consulta.',
      },
      {
        title: 'Una cuenta, varias mascotas',
        description: 'Administra perros, gatos y otras mascotas desde el mismo panel.',
      },
      {
        title: 'Disponible en cualquier momento',
        description: 'Abre el carnet digital desde tu celular cuando más lo necesitas.',
      },
      {
        title: 'Privacidad por defecto',
        description: 'Tu información queda concentrada en un espacio personal y protegido.',
      },
    ],
  },
  experience: {
    eyebrow: 'Experiencia real',
    title: 'Preparado para los momentos en que necesitas responder rápido.',
    description:
      'Cuando estás en una consulta, una urgencia o simplemente planificando la siguiente vacuna, la información importante ya está ordenada.',
  },
  closingCta: {
    eyebrow: 'Siguiente paso',
    title: 'Explora la plataforma hoy y deja el historial de tus mascotas mucho más ordenado.',
    description:
      'La demo te permite recorrer el producto ahora mismo. Si ya tienes acceso, entra con tu cuenta y sigue trabajando.',
    primaryCta: 'Entrar a la demo',
    secondaryCta: 'Ver registro',
    demoTitle: 'Credenciales demo',
    demoUserLabel: 'Usuario',
    demoUserValue: 'test@pettrack.cl',
    demoPasswordLabel: 'Contraseña',
    demoPasswordValue: 'pettrack',
    demoFootnote:
      'La cuenta demo incluye datos de ejemplo para recorrer dashboard, mascotas y eventos.',
  },
} as const;
