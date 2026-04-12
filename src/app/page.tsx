'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { PawPrint, Heart, Shield, Smartphone } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Si el usuario está logueado, redirigir al dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return <Loading text="Cargando..." />;
  }

  // Si ya está logueado, no mostrar nada (va a redirigir)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
              <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                <PawPrint className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Carnet Veterinario Digital
          </h1>
          <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Gestiona el historial médico completo de tus mascotas en un solo lugar.
            <span className="block mt-2 text-lg text-gray-600">
              Vacunas, visitas veterinarias y tratamientos al alcance de tu mano 🐾
            </span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-4">
                <span className="mr-2">🚀</span>
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Ingresar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Credentials Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 shadow-lg animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
              🎯 Prueba la Demo
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              Mientras el registro está deshabilitado, usa estas credenciales para explorar la plataforma:
            </p>
            <div className="max-w-md mx-auto bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">📧 Usuario:</span>
                  <code className="text-base font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                    test@pettrack.cl
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">🔒 Contraseña:</span>
                  <code className="text-base font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                    pettrack
                  </code>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-gray-100">
                <Link href="/login?demo=true">
                  <Button className="w-full text-base py-3">
                    <span className="mr-2">✨</span>
                    Probar ahora
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-6 italic">
              💡 Esta cuenta demo contiene datos de ejemplo para que explores todas las funcionalidades
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-pink-200">
            <div className="p-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Historial Completo</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Registra vacunas, visitas al veterinario y tratamientos médicos en una timeline visual
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Seguro y Privado</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Tus datos están protegidos con encriptación de nivel bancario. Solo tú tienes acceso
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-blue-200">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Siempre Disponible</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Accede desde cualquier dispositivo: móvil, tablet o computadora
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Empieza a cuidar mejor de tus mascotas hoy
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Gratis para siempre. Sin tarjeta de crédito. Sin límites.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="text-lg px-10 py-4 shadow-2xl hover:shadow-3xl">
              <span className="mr-2">✨</span>
              Crear cuenta gratis
            </Button>
          </Link>
          <p className="mt-6 text-blue-100 text-sm">
            🎉 Únete a miles de dueños que confían en nosotros
          </p>
        </div>
      </div>
    </div>
  );
}
