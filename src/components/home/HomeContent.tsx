'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import {
  CheckCircle,
  Clock,
  Heart,
  PawPrint,
  Share2,
  Shield,
  Smartphone,
} from 'lucide-react';

const featureCards = [
  {
    title: 'Historial claro y ordenado',
    description: 'Vacunas, controles y tratamientos en una línea de tiempo fácil de revisar.',
    icon: Heart,
    accent: 'from-rose-500 to-orange-400',
    surface: 'bg-rose-50',
  },
  {
    title: 'Recordatorios útiles',
    description: 'Mantente atento a próximas dosis y visitas sin depender de notas sueltas.',
    icon: Clock,
    accent: 'from-amber-500 to-yellow-400',
    surface: 'bg-amber-50',
  },
  {
    title: 'Comparte con tu veterinario',
    description: 'Prepara el contexto clínico de tu mascota antes de cada consulta.',
    icon: Share2,
    accent: 'from-emerald-500 to-teal-400',
    surface: 'bg-emerald-50',
  },
  {
    title: 'Una cuenta, varias mascotas',
    description: 'Administra perros, gatos y otras mascotas desde el mismo panel.',
    icon: PawPrint,
    accent: 'from-sky-500 to-cyan-400',
    surface: 'bg-sky-50',
  },
  {
    title: 'Disponible en cualquier momento',
    description: 'Abre el carnet digital desde tu celular cuando más lo necesitas.',
    icon: Smartphone,
    accent: 'from-indigo-500 to-blue-400',
    surface: 'bg-indigo-50',
  },
  {
    title: 'Privacidad por defecto',
    description: 'Tu información queda concentrada en un espacio personal y protegido.',
    icon: Shield,
    accent: 'from-slate-700 to-slate-500',
    surface: 'bg-slate-100',
  },
] as const;

const trustPoints = [
  'Acceso inmediato a la demo',
  'Pensado para uso diario en consulta',
  'Hecho para familias con varias mascotas',
] as const;

const testimonials = [
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
] as const;

export function HomeContent() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_36%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_38%,_#f7fbff_100%)]">
        <Container className="py-24">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
              <PawPrint className="h-10 w-10 text-white" />
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Tu carnet está listo
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Bienvenido de vuelta a tu panel de mascotas
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Entra a tu dashboard para revisar historiales, agregar eventos médicos y mantener todo al día.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="min-w-52">
                  Ir al dashboard
                </Button>
              </Link>
              <Link href="/dashboard/feedback">
                <Button variant="secondary" size="lg" className="min-w-52">
                  Ver feedback
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_36%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_38%,_#f7fbff_100%)]">
      <section className="relative">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_80%_12%,_rgba(251,146,60,0.18),_transparent_28%),radial-gradient(circle_at_50%_52%,_rgba(59,130,246,0.09),_transparent_36%)]" />
        <Container className="grid gap-14 pb-20 pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-900 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Historial veterinario simple, claro y siempre contigo
            </div>
            <h1 className="mt-7 text-5xl font-black leading-none tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Toda la salud de tu mascota en un solo lugar.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Organiza vacunas, controles y tratamientos en un carnet digital fácil de mostrar cuando lo necesites.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login?demo=true">
                <Button size="lg" className="min-w-52">
                  Probar demo
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="min-w-52">
                  Ingresar ahora
                </Button>
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-sm">
              <p className="font-semibold">Registro temporalmente cerrado</p>
              <p className="mt-1 text-amber-800">
                Mientras reabrimos nuevas cuentas, puedes explorar la experiencia con la demo o entrar si ya tienes acceso.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-12 hidden h-32 w-32 rounded-full bg-sky-300/25 blur-3xl lg:block" />
            <div className="absolute -bottom-10 right-4 hidden h-40 w-40 rounded-full bg-orange-300/25 blur-3xl lg:block" />

            <div className="relative rounded-[2rem] border border-white/75 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                      Panel de mascota
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Luna, 4 años</h2>
                  </div>
                  <div className="rounded-2xl bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-800">
                    Carnet activo
                  </div>
                </div>

                <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">Último control</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">12 Abril</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Próxima vacuna</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">26 Abril</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estado</p>
                    <p className="mt-1 text-lg font-bold text-emerald-600">Al día</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ['Vacuna antirrábica', 'Próxima dosis en 8 días'],
                    ['Control anual', 'Resumen clínico listo para compartir'],
                    ['Tratamiento digestivo', 'Historial actualizado'],
                  ].map(([title, subtitle]) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="text-sm text-slate-500">{subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-sky-200">Acceso rápido</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold">Abre el historial desde tu teléfono antes de la consulta.</p>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-sky-100">
                      QR listo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20 lg:pb-24">
        <Container>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Por qué funciona
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Menos papeles, menos dudas, mejor seguimiento.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Diseñado para que cualquier tutor encuentre la información clave en segundos, incluso desde el celular.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.06)] backdrop-blur transition-transform duration-200 hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex rounded-2xl p-3 text-white shadow-lg bg-gradient-to-br ${feature.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className={`mt-5 rounded-2xl ${feature.surface} p-4`}>
                    <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200/70 bg-white/70 py-20 backdrop-blur">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Experiencia real
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Preparado para los momentos en que necesitas responder rápido.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Cuando estás en una consulta, una urgencia o simplemente planificando la siguiente vacuna, la información importante ya está ordenada.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.author}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-5 flex gap-1 text-amber-400">
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                </div>
                <blockquote className="text-base leading-7 text-slate-700">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 font-semibold text-slate-950">{testimonial.author}</figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-24">
        <Container>
          <div className="grid gap-8 rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:px-8 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">
                Siguiente paso
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Explora la plataforma hoy y deja el historial de tus mascotas mucho más ordenado.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                La demo te permite recorrer el producto ahora mismo. Si ya tienes acceso, entra con tu cuenta y sigue trabajando.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login?demo=true">
                  <Button size="lg" className="min-w-52">
                    Entrar a la demo
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary" size="lg" className="min-w-52 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                    Ver registro
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
                Credenciales demo
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white px-4 py-3 text-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Usuario</p>
                  <code className="mt-2 block text-base font-semibold">test@pettrack.cl</code>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contraseña</p>
                  <code className="mt-2 block text-base font-semibold">pettrack</code>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                La cuenta demo incluye datos de ejemplo para recorrer dashboard, mascotas y eventos.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
