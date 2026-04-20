import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Container } from '@/components/ui/Container';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md w-full">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Registro Temporalmente Cerrado
          </h1>
          <p className="text-gray-600 text-lg">
            Estamos mejorando la plataforma. Vuelve pronto para crear tu cuenta.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-card border-2 border-gray-100">
          <SignupForm />

          <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
              >
                Ingresa aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-amber-700 font-medium">Registro temporalmente deshabilitado</p>
          <p className="text-xs text-gray-500">
            Si ya tienes cuenta, puedes{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              iniciar sesión aquí
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
