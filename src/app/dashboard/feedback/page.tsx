'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bug, MessageSquareHeart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';

export default function FeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { feedback, loading, fetchFeedback } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  if (authLoading || loading) {
    return <Loading text="Cargando tus reportes..." />;
  }

  if (!user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex items-center text-base font-semibold text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver al dashboard
        </Link>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mis reportes de feedback
            </h1>
            <p className="text-lg text-gray-600">
              Comparte bugs o ideas de mejora y sigue el estado de tus envíos.
            </p>
          </div>

          <Button size="lg" onClick={() => setIsModalOpen(true)}>
            <MessageSquareHeart className="mr-2 h-5 w-5" />
            Enviar feedback
          </Button>
        </div>

        {feedback.length === 0 ? (
          <div className="rounded-3xl border-2 border-gray-100 bg-white p-12 shadow-card">
            <EmptyState
              icon={
                <div className="rounded-3xl bg-gradient-to-br from-rose-400 to-orange-500 p-6 shadow-xl">
                  <Bug className="h-20 w-20 text-white" />
                </div>
              }
              title="Aún no has enviado feedback"
              description="Si encontraste un bug o se te ocurrió una mejora, este es el mejor lugar para contárnoslo."
              actionLabel="Enviar mi primer reporte"
              onAction={() => setIsModalOpen(true)}
            />
          </div>
        ) : (
          <div className="grid gap-5">
            {feedback.map((entry) => (
              <FeedbackCard key={entry.id} feedback={entry} />
            ))}
          </div>
        )}
      </Container>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSubmitted={fetchFeedback}
      />
    </div>
  );
}
