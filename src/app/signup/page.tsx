import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Container } from '@/components/ui/Container';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md w-full">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
            Crear cuenta gratis
          </h1>
          <p className="text-gray-600 text-lg">
            Empieza a gestionar el historial de tus mascotas en minutos
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-card border-2 border-gray-100">
          <SignupForm />

          <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                Ingresa aquí
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          🔒 Tus datos están protegidos y encriptados
        </p>
      </Container>
    </div>
  );
}
