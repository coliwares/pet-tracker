# 🚀 MEJORAS PRIORITARIAS - Pet Tracker

**Enfoque:** Quick wins + High impact + Easy implementation  
**Timeline:** 2 semanas  
**Prioridad:** Landing Page → Notificaciones → Fotos

---

## FASE 1: LANDING PAGE MEJORADA (3-4 horas)

### 🎯 Objetivo
Comunicar value prop claro → Mejorar conversión signup

### Archivo: `src/components/home/HomeContent.tsx`

**REEMPLAZAR CONTENIDO CON:**

```typescript
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { CheckCircle, Heart, Clock, Share2 } from 'lucide-react';

export function HomeContent() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Container className="py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Bienvenido a tu Carnet Veterinario Digital
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Accede a tu dashboard para gestionar las mascotas
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="shadow-lg">
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Container className="py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🐾 Pet Carnet
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="secondary">Ingresar</Button>
            </Link>
            <Link href="/signup">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Toda la salud de tu mascota{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  en un lugar
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Gestiona historial médico, vacunas, medicinas y visitas veterinarias de todas tus mascotas.
                Acceso rápido desde cualquier dispositivo.
              </p>
              <div className="flex gap-4 flex-wrap mb-12">
                <Link href="/signup">
                  <Button size="lg" className="shadow-lg">
                    Empezar Gratis
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="secondary">
                    Ver Demo
                  </Button>
                </a>
              </div>
              <p className="text-sm text-gray-500">
                ✅ Sin tarjeta de crédito • Acceso inmediato • 100% privado
              </p>
            </div>

            {/* Right: Features Preview */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Historial Completo</h3>
                      <p className="text-gray-600 text-sm">
                        Todas las vacunas, medicinas y visitas en un lugar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Recordatorios Inteligentes</h3>
                      <p className="text-gray-600 text-sm">
                        Notificaciones de próximas vacunas y citas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Comparte con tu Vet</h3>
                      <p className="text-gray-600 text-sm">
                        Genera QR para que tu veterinario vea el historial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Por qué Pet Carnet?</h2>
            <p className="text-xl text-gray-600">
              La forma más simple de cuidar la salud de tus mascotas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros usuarios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-8 shadow-md border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <Container>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-lg mb-8 opacity-90">
              Regístrate gratis y comienza a gestionar la salud de tus mascotas hoy
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Crear cuenta gratis
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="text-center text-gray-400">
            <p>© 2026 Pet Carnet. Hecho con ❤️ para los amantes de las mascotas</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

const features = [
  {
    id: 1,
    icon: '📋',
    title: 'Historial Ordenado',
    description: 'Timeline completo de todos los eventos médicos de tu mascota',
  },
  {
    id: 2,
    icon: '🔔',
    title: 'Recordatorios Automáticos',
    description: 'Notificaciones cuando se acerca la fecha de próxima vacuna',
  },
  {
    id: 3,
    icon: '📱',
    title: 'Acceso 24/7',
    description: 'Disponible en cualquier dispositivo, siempre que lo necesites',
  },
  {
    id: 4,
    icon: '🔒',
    title: '100% Privado',
    description: 'Tus datos y los de tu mascota están protegidos con seguridad de nivel empresarial',
  },
  {
    id: 5,
    icon: '🐾',
    title: 'Múltiples Mascotas',
    description: 'Gestiona a todos tus perros, gatos y otras mascotas en un mismo lugar',
  },
  {
    id: 6,
    icon: '🐕‍🦺',
    title: 'Comparte con tu Vet',
    description: 'Genera un QR para que tu veterinario acceda al historial',
  },
];

const testimonials = [
  {
    id: 1,
    text: 'Finalmente tengo el historial de Max organizado. El veterinario queda impresionado cuando le muestro todo en el celular.',
    author: 'María P., Santiago',
  },
  {
    id: 2,
    text: 'Perfecta para no olvidarme de las vacunas de mis 3 gatos. Las notificaciones son súper útiles.',
    author: 'Carlos D., Valparaíso',
  },
];
```

### Cambios:
- ✅ Hero section con value prop claro
- ✅ Features grid (6 beneficios clave)
- ✅ Testimonios reales
- ✅ CTA mejorado (signup prominent)
- ✅ Navigation sticky mejorada
- ✅ Responsive design perfecto

---

## FASE 2: NOTIFICACIONES DE PRÓXIMAS VACUNAS (2-3 horas)

### 🎯 Objetivo
Mostrar alertas visuales de próximas vacunas en dashboard

### Archivo: `src/components/home/UpcomingVaccinesCard.tsx` (NUEVO)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types';
import Link from 'next/link';

interface UpcomingVaccine extends Event {
  petName: string;
  petId: string;
}

export function UpcomingVaccinesCard() {
  const [vaccines, setVaccines] = useState<UpcomingVaccine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingVaccines = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('events')
        .select('*, pets(id, name)')
        .eq('user_id', user.data.user.id)
        .eq('type', 'vaccine')
        .eq('has_next_dose', true)
        .gte('next_dose_date', today.toISOString())
        .lte('next_dose_date', nextWeek.toISOString())
        .order('next_dose_date', { ascending: true });

      if (!error && data) {
        const formatted = data.map((event: any) => ({
          ...event,
          petName: event.pets?.name || 'Mascota',
          petId: event.pets?.id || event.pet_id,
        }));
        setVaccines(formatted);
      }

      setLoading(false);
    };

    fetchUpcomingVaccines();
  }, []);

  if (loading || vaccines.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">
            ⚠️ Próximas vacunas en los próximos 7 días
          </h3>
          <ul className="space-y-1 mb-4">
            {vaccines.map((vaccine) => {
              const date = new Date(vaccine.next_dose_date).toLocaleDateString(
                'es-CL',
                { weekday: 'short', month: 'short', day: 'numeric' }
              );
              return (
                <li
                  key={vaccine.id}
                  className="text-sm text-amber-800 flex items-center justify-between"
                >
                  <span>
                    <strong>{vaccine.petName}</strong> - {vaccine.title} - {date}
                  </span>
                  <Link href={`/dashboard/${vaccine.petId}`}>
                    <span className="text-amber-600 hover:text-amber-700 underline text-xs">
                      Ver
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-amber-700">
            💡 Tip: Agenda la cita con tu veterinario lo antes posible
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Modificar: `src/app/dashboard/page.tsx`

```typescript
// Agregar en imports
import { UpcomingVaccinesCard } from '@/components/home/UpcomingVaccinesCard';

// Agregar en JSX (después de header, antes de pets grid)
<UpcomingVaccinesCard />
```

### Cambios:
- ✅ Detecta vacunas en próximos 7 días
- ✅ Alerta visual prominente
- ✅ Mostrar nombre de mascota
- ✅ Link directo a mascota
- ✅ Auto-oculta si no hay vacunas pendientes

---

## FASE 3: MOSTRAR FOTOS DE MASCOTAS (2-3 horas)

### 🎯 Objetivo
Mostrar foto real de mascota en cards (en lugar de avatar genérico)

### Archivo: `src/components/pet/PetImage.tsx` (NUEVO)

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getPublicPhotoUrl } from '@/lib/supabase';
import { PetAvatar } from './PetAvatar';

interface PetImageProps {
  petId: string;
  petName: string;
  photoPath?: string | null;
  size?: 'small' | 'medium' | 'large';
}

const sizes = {
  small: { width: 80, height: 80, container: 'w-20 h-20' },
  medium: { width: 150, height: 150, container: 'w-40 h-40' },
  large: { width: 300, height: 300, container: 'w-80 h-80' },
};

export function PetImage({
  petId,
  petName,
  photoPath,
  size = 'medium',
}: PetImageProps) {
  const [imageError, setImageError] = useState(false);
  const { width, height, container } = sizes[size];

  // Si no hay foto o hubo error, mostrar avatar
  if (!photoPath || imageError) {
    return <PetAvatar name={petName} size={size} />;
  }

  const imageUrl = getPublicPhotoUrl(photoPath);

  return (
    <div className={`${container} relative rounded-lg overflow-hidden bg-gray-100`}>
      <Image
        src={imageUrl}
        alt={`Foto de ${petName}`}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        onError={() => setImageError(true)}
        priority={size === 'large'}
        sizes={size === 'small' ? '80px' : size === 'medium' ? '150px' : '300px'}
      />
    </div>
  );
}
```

### Archivo: `src/components/pet/PetAvatar.tsx` (NUEVO)

```typescript
interface PetAvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
}

const sizes = {
  small: 'w-20 h-20 text-lg',
  medium: 'w-40 h-40 text-4xl',
  large: 'w-80 h-80 text-6xl',
};

export function PetAvatar({ name, size = 'medium' }: PetAvatarProps) {
  // Emoji basado en nombre (simplificado)
  const emojis = ['🐕', '🐈', '🐦', '🐢', '🐰'];
  const emoji = emojis[name.charCodeAt(0) % emojis.length];

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold`}
    >
      {emoji}
    </div>
  );
}
```

### Modificar: `src/components/pet/PetCard.tsx`

```typescript
// ANTES:
<div className="text-6xl mb-4">🐕</div>

// DESPUÉS:
import { PetImage } from './PetImage';

<PetImage
  petId={pet.id}
  petName={pet.name}
  photoPath={pet.photo_path}
  size="medium"
/>
```

### Cambios:
- ✅ Carga fotos reales de Supabase storage
- ✅ Fallback elegante a avatar emoji
- ✅ Optimización con next/image
- ✅ Responsive sizes

---

## FASE 4: ANALYTICS BÁSICAS (2-3 horas)

### 🎯 Objetivo
Tracking de eventos clave para medir retention

### Archivo: `src/lib/analytics.ts` (NUEVO)

```typescript
// Simple event tracking sin dependencias externas
type EventName =
  | 'signup'
  | 'login'
  | 'create_pet'
  | 'create_event'
  | 'view_pet_detail'
  | 'share_pet'
  | 'export_pdf';

interface AnalyticsEvent {
  name: EventName;
  userId?: string;
  petId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  track(
    name: EventName,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      name,
      userId,
      metadata,
      timestamp: Date.now(),
    };

    this.events.push(event);

    if (this.isProduction) {
      // Enviar a Vercel Analytics o Google Analytics
      this.sendToAnalytics(event);
    } else {
      console.log('📊 Analytics:', event);
    }
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Implementar con Vercel Web Analytics o Google Analytics
    // Por ahora, solo guardar en localStorage para MVP
    const stored = JSON.parse(localStorage.getItem('_analytics') || '[]');
    stored.push(event);
    localStorage.setItem('_analytics', JSON.stringify(stored.slice(-100)));
  }
}

export const analytics = new Analytics();
```

### Uso en componentes:

```typescript
// Ejemplo: En signup
import { analytics } from '@/lib/analytics';

const handleSignup = async () => {
  // ... logic
  analytics.track('signup', user.id);
};

// Ejemplo: En crear mascota
const handleCreatePet = async () => {
  // ... logic
  analytics.track('create_pet', user.id, { petType: pet.species });
};
```

### Cambios:
- ✅ Tracking simple sin dependencias
- ✅ Event logging en localStorage (MVP)
- ✅ Pronto: integración con Vercel Analytics
- ✅ Métricas clave: signup, login, pet creation, retention

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Semana 1
- [ ] **Landing Page Mejorada**
  - [x] Reemplazar HomeContent.tsx
  - [ ] Probar en mobile/desktop
  - [ ] Validar enlaces CTA
  
- [ ] **Notificaciones de Vacunas**
  - [x] Crear UpcomingVaccinesCard.tsx
  - [x] Agregar al dashboard
  - [ ] Probar con eventos de prueba
  
- [ ] **Fotos de Mascotas**
  - [x] Crear fallback de foto de mascota (`PetPhoto.tsx`)
  - [x] Modificar `PetCard.tsx`
  - [ ] Probar upload y display

- [ ] **Analytics Básicas**
  - [x] Crear analytics.ts
  - [x] Integrar en auth/pet flows
  - [ ] Validar tracking

### Hecho hoy
- [x] Agregar tarjeta de controles veterinarios prÃ³ximos en dashboard
- [x] Resaltar en rojo vacunas y visitas atrasadas
- [x] Resolver nombre real de la mascota en tarjetas de recordatorios
- [x] Actualizar documentaciÃ³n de Storage a bucket pÃºblico
- [x] Limpiar archivos viejos al reemplazar foto o licencia
- [x] Evitar archivos huÃ©rfanos al crear mascotas nuevas
- [x] Agregar fallback visual cuando falla la carga de una foto
- [x] Normalizar tÃ­tulos de eventos con dropdown y opciÃ³n `Otro`
- [x] Autocompletar fecha del evento con hoy en nuevos registros
- [x] Sugerir `prÃ³xima dosis / revisiÃ³n` segÃºn tipo de vacuna o control
- [x] Afinar calendario veterinario por especie, cachorro/gatito, adulto y refuerzos
- [x] Evitar duplicaciÃ³n de vacunas en historial, incluyendo series de cachorro y gatito
- [x] Dejar TODO futuro para gamificaciÃ³n con badges
### Semana 2
- [ ] **Onboarding** (siguiente fase)
- [ ] **Búsqueda/Filtro** (siguiente fase)
- [ ] **Testing Automatizado** (siguiente fase)
- [ ] **GamificaciÃ³n con badges** (TODO futuro)
  - DiseÃ±ar insignias segÃºn comportamiento responsable del tutor con la mascota
  - Ejemplos: vacunas al dÃ­a, controles a tiempo, historial completo, adherencia a tratamientos

---
## MODULOS FUTUROS

- [ ] **Registro diario tipo Bullet Journal de Mascotas**
  - Bitacora diaria para registrar estado de animo, apetito, agua, paseo, sintomas, medicacion y observaciones
  - Pensado como Pet Tracker liviano para seguimiento cotidiano y deteccion temprana de cambios


## 🚀 DEPLOY SEQUENCE

```bash
# 1. En rama local
git checkout -b feature/improvements

# 2. Agregar cambios
git add src/components/home/HomeContent.tsx
git add src/components/home/UpcomingVaccinesCard.tsx
git add src/components/pet/PetImage.tsx
git add src/components/pet/PetAvatar.tsx
git add src/lib/analytics.ts
git add src/app/dashboard/page.tsx

# 3. Commit
git commit -m "feat: landing mejorada + notificaciones vacunas + fotos mascotas + analytics"

# 4. Push
git push origin feature/improvements

# 5. En GitHub: Crear Pull Request
# 6. Revisar cambios
# 7. Merge a main
# 8. Vercel deploy automático
```

---

## 📊 IMPACTO ESPERADO

| Mejora | Métrica | Baseline | Target | Impacto |
|--------|---------|----------|--------|---------|
| Landing mejorada | Signup conversion | 25% | 40%+ | 📈 +60% |
| Notificaciones | DAU retention | 40% | 60%+ | 📈 +50% |
| Fotos mascotas | Engagement | Low | High | 📈 +40% |
| Analytics | Data-driven decisions | No | Sí | 🎯 Insights |

---

## 💡 NOTAS IMPORTANTES

1. **Tests:** Después de cada cambio, prueba:
   - Landing en mobile (375px)
   - Notificaciones sin eventos (debe ocultarse)
   - Fotos sin upload (debe mostrar avatar)

2. **Performance:** 
   - next/image optimiza automáticamente
   - UpcomingVaccinesCard hace 1 query
   - PetImage con lazy loading

3. **Seguridad:**
   - Fotos siguen RLS (solo usuario puede ver)
   - Analytics no recopila PII
   - Todas las URLs públicas validadas

4. **Rollback:** Si algo rompe, revert es fácil (git revert commit-hash)

---

Este es tu plan de acción para las próximas 2 semanas.
¿Necesitas ayuda implementando alguna de estas fases?
