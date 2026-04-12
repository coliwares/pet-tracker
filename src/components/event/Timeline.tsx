import { Event } from '@/lib/types';
import { EventCard } from './EventCard';

interface TimelineProps {
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No hay eventos registrados</h3>
        <p className="text-gray-500">Comienza agregando vacunas, visitas o tratamientos médicos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
