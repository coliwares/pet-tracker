'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { deleteEvent } from '@/lib/supabase';
import { Calendar, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteEvent(event.id);
      router.refresh();
      window.location.reload(); // Force refresh to update timeline
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
      <div className="group bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                EVENT_TYPE_COLORS[event.type]
              }`}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </div>
          <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 text-base text-gray-700 mb-3 font-medium">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calendar className="h-4 w-4 text-blue-600" />
        </div>
        <span>{formatDate(event.event_date)}</span>
      </div>

      {event.description && (
        <p className="text-base text-gray-600 mb-3 leading-relaxed">{event.description}</p>
      )}

      {event.next_due_date && (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
          <span className="font-bold text-amber-800 flex items-center gap-2">
            <span className="text-lg">⏰</span>
            Próxima dosis: {formatDate(event.next_due_date)}
          </span>
        </div>
      )}

      {event.file_url && (
        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-fit">
          <FileText className="h-4 w-4" />
          <span>Archivo adjunto</span>
        </div>
      )}

      {event.notes && (
        <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
          💬 {event.notes}
        </p>
      )}

      <div className="mt-4 flex gap-2 pt-4 border-t-2 border-gray-50">
        <Link href={`/dashboard/${event.pet_id}/events/${event.id}/edit`}>
          <Button variant="ghost" size="sm" className="font-semibold">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
        >
          <Trash2 className="h-4 w-4 mr-1" />
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
        <p className="text-gray-600">
          ¿Estás seguro de que deseas eliminar este evento?
        </p>
        <p className="text-gray-600 mt-2">
          <strong>{event.title}</strong> - {formatDate(event.event_date)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </>
  );
}
