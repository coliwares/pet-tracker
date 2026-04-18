'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { getFeedbackAdminStatus } from '@/lib/supabase';
import { LayoutDashboard, LogOut, MessageSquareMore, PawPrint, ShieldCheck } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const data = await getFeedbackAdminStatus();
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  return (
    <>
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Carnet Veterinario
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/feedback" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    <MessageSquareMore className="h-4 w-4 mr-2" />
                    Mis reportes
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/admin/feedback" className="hidden md:block">
                    <Button variant="ghost" size="sm">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Panel feedback
                    </Button>
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsFeedbackModalOpen(true)}>
                  <MessageSquareMore className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      </header>

      {user?.email && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          userId={user.id}
          userEmail={user.email}
        />
      )}
    </>
  );
}
