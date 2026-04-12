import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Container } from '@/components/ui/Container';
import { LoginPageContent } from '@/components/auth/LoginPageContent';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md w-full">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-600 text-lg">
            Ingresa a tu cuenta para gestionar tus mascotas
          </p>
        </div>

        <Suspense fallback={<div className="bg-white p-8 rounded-2xl shadow-card border-2 border-gray-100"><LoginForm /></div>}>
          <LoginPageContent />
        </Suspense>

        <div className="bg-white p-8 rounded-2xl shadow-card border-2 border-gray-100 mt-6">
          <div className="text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
