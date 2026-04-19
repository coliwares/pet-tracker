'use client';

import { Syringe } from 'lucide-react';
import { UpcomingDueEventsCard } from '@/components/home/UpcomingDueEventsCard';

export function UpcomingVaccinesCard() {
  return (
    <UpcomingDueEventsCard
      type="vacuna"
      title="Próximas vacunas"
      singularLabel="vacuna cercana"
      pluralLabel="vacunas cercanas"
      description="Revisa las mascotas con dosis pendientes para que no se te pase ninguna fecha importante."
      badgeLabel="Próximas vacunas"
      icon={Syringe}
      theme={{
        sectionBorder: 'border-amber-200',
        sectionBg: 'bg-[linear-gradient(135deg,_#fff8e8_0%,_#ffffff_100%)]',
        sectionShadow: 'shadow-[0_20px_55px_rgba(245,158,11,0.12)]',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900',
        normalPill: 'bg-amber-50 text-amber-800',
        normalIcon: 'bg-amber-100 text-amber-700',
      }}
    />
  );
}
