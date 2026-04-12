import { Suspense } from 'react';
import { HomeContent } from '@/components/home/HomeContent';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />}>
      <HomeContent />
    </Suspense>
  );
}
