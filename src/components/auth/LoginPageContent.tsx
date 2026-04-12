'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from './LoginForm';

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <>
      {isDemo && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 text-base mb-1">
                Cuenta Demo Precargada
              </h3>
              <p className="text-emerald-800 text-sm">
                Los campos han sido rellenados automáticamente. Solo haz click en "Ingresar" para explorar la plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-card border-2 border-gray-100">
        <LoginForm />
      </div>
    </>
  );
}
