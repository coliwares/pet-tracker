'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import { buildGoogleCalendarUrl, formatDate } from '@/lib/utils';
import { deleteEvent } from '@/lib/supabase';
import { deleteStorageFile } from '@/lib/storage';
import { Calendar, Edit, ExternalLink, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const calendarUrl = buildGoogleCalendarUrl(event);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteEvent(event.id);

      if (event.file_url) {
        const deleted = await deleteStorageFile(event.file_url);
        if (!deleted) {
          console.warn('No se pudo eliminar el archivo adjunto del evento');
        }
      }

      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Error al eliminar el evento');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="group rounded-2xl border-2 border-gray-100 bg-white p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-card-hover">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-bold shadow-sm ${
                  EVENT_TYPE_COLORS[event.type]
                }`}
              >
                {EVENT_TYPE_LABELS[event.type]}
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {event.title}
            </h4>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 text-base font-medium text-gray-700">
          <div className="rounded-lg bg-blue-50 p-2">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <span>{formatDate(event.event_date)}</span>
        </div>

        {event.description && (
          <p className="mb-3 text-base leading-relaxed text-gray-600">{event.description}</p>
        )}

        {event.next_due_date && (
          <div className="mt-3 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
            <span className="flex items-center gap-2 font-bold text-amber-800">
              <span className="text-lg">⏰</span>
              Próxima dosis: {formatDate(event.next_due_date)}
            </span>
          </div>
        )}

        {event.file_url && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <FileText className="h-4 w-4" />
              <span>Imagen adjunta</span>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="overflow-hidden rounded-xl border border-blue-100 bg-white">
                <Image
                  src={event.file_url}
                  alt={`Adjunto de ${event.title}`}
                  width={112}
                  height={112}
                  className="h-28 w-28 object-cover"
                  unoptimized
                />
              </div>
              <a
                href={event.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Ver imagen completa
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {event.notes && (
          <p className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm italic text-gray-600">
            {event.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-gray-50 pt-4">
          <a href={calendarUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" className="font-semibold">
              <Calendar className="mr-1 h-4 w-4" />
              Agregar a calendario
            </Button>
          </a>
          <Link href={`/dashboard/${event.pet_id}/events/${event.id}/edit`}>
            <Button variant="ghost" size="sm" className="font-semibold">
              <Edit className="mr-1 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Evento"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      >
        <p className="text-gray-600">¿Estás seguro de que deseas eliminar este evento?</p>
        <p className="mt-2 text-gray-600">
          <strong>{event.title}</strong> - {formatDate(event.event_date)}
        </p>
        <p className="mt-2 text-sm text-gray-500">Esta acción no se puede deshacer.</p>
      </Modal>
    </>
  );
}
