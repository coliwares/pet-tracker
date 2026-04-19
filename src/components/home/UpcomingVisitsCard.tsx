'use client';

import { Calendar } from 'lucide-react';
import { UpcomingDueEventsCard } from '@/components/home/UpcomingDueEventsCard';

export function UpcomingVisitsCard() {
  return (
    <UpcomingDueEventsCard
      type="visita"
      title="Próximos controles"
      singularLabel="control cercano"
      pluralLabel="controles cercanos"
      description="Revisa los controles veterinarios pendientes para mantener al día las visitas importantes."
      badgeLabel="Próximos controles"
      icon={Calendar}
      theme={{
        sectionBorder: 'border-emerald-200',
        sectionBg: 'bg-[linear-gradient(135deg,_#ecfdf5_0%,_#ffffff_100%)]',
        sectionShadow: 'shadow-[0_20px_55px_rgba(16,185,129,0.12)]',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        normalPill: 'bg-emerald-50 text-emerald-800',
        normalIcon: 'bg-emerald-100 text-emerald-700',
      }}
    />
  );
}
