'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Event, EventType, Pet } from '@/lib/types';
import { EVENT_CATALOG, EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/constants';
import { getPet } from '@/lib/supabase';
import { applyDueRule, calculateAgeInMonths, getEventCatalogOptions, toDateInputValue } from '@/lib/utils';
import { compressImage, deleteStorageFile, uploadEventAttachment, validateFile } from '@/lib/storage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface EventFormSubmitOptions {
  mode: 'create' | 'update';
  eventId?: string;
}

interface EventFormProps {
  petId: string;
  userId: string;
  event?: Event;
  initialType?: EventType;
  onSubmit: (data: Partial<Event>, options: EventFormSubmitOptions) => Promise<Event>;
  onSuccess?: (event: Event) => void | Promise<void>;
  submitLabel?: string;
}

const CUSTOM_TITLE_VALUE = '__custom__';

const eventIcons: Record<EventType, string> = {
  vacuna: '💉',
  visita: '🏥',
  medicina: '💊',
  otro: '📋',
};

export function EventForm({
  petId,
  userId,
  event,
  initialType,
  onSubmit,
  onSuccess,
  submitLabel = 'Guardar',
}: EventFormProps) {
  const [type, setType] = useState<EventType>(event?.type || initialType || 'vacuna');
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(event?.event_date || toDateInputValue(new Date()));
  const [nextDueDate, setNextDueDate] = useState(event?.next_due_date || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextDueDateTouched, setNextDueDateTouched] = useState(Boolean(event?.next_due_date));
  const [pet, setPet] = useState<Pet | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(event?.file_url || null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const data = await getPet(petId);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet for event form:', err);
      }
    };

    if (petId) {
      void fetchPet();
    }
  }, [petId]);

  const catalogOptions = useMemo(
    () => getEventCatalogOptions(EVENT_CATALOG[type], pet),
    [pet, type]
  );
  const standardTitles = useMemo(
    () => catalogOptions.map((option) => option.title),
    [catalogOptions]
  );
  const selectedTitle = useMemo(
    () =>
      type === 'otro' || (title && !standardTitles.includes(title))
        ? CUSTOM_TITLE_VALUE
        : title || '',
    [standardTitles, title, type]
  );

  const getSuggestedNextDueDate = (
    nextEventDate: string,
    nextTitle: string,
    nextType = type
  ) => {
    if (nextType === 'otro' || !nextTitle) {
      return '';
    }

    const nextCatalogItem = getEventCatalogOptions(EVENT_CATALOG[nextType], pet).find(
      (option) => option.title === nextTitle
    );

    return applyDueRule(nextEventDate, nextCatalogItem?.nextDueRule) ?? '';
  };

  const showCustomTitleInput = type === 'otro' || selectedTitle === CUSTOM_TITLE_VALUE;

  const handleTypeChange = (nextType: EventType) => {
    setType(nextType);

    if (nextType === 'otro') {
      if (!event || event.type !== 'otro') {
        setTitle('');
      }
      if (!nextDueDateTouched) {
        setNextDueDate('');
      }
      return;
    }

    const nextTitles = getEventCatalogOptions(EVENT_CATALOG[nextType], pet).map(
      (option) => option.title
    );

    if (title && nextTitles.includes(title)) {
      if (!nextDueDateTouched) {
        setNextDueDate(getSuggestedNextDueDate(eventDate, title, nextType));
      }
      return;
    }

    if (!event || event.type !== nextType) {
      setTitle('');
    }
    if (!nextDueDateTouched) {
      setNextDueDate('');
    }
  };

  const petContextLabel = useMemo(() => {
    if (!pet) {
      return null;
    }

    if (pet.species === 'Perro') {
      const ageInMonths = pet.birth_date ? calculateAgeInMonths(pet.birth_date) : null;
      return ageInMonths !== null && ageInMonths < 12 ? 'Perro cachorro' : 'Perro adulto';
    }

    if (pet.species === 'Gato') {
      const ageInMonths = pet.birth_date ? calculateAgeInMonths(pet.birth_date) : null;
      return ageInMonths !== null && ageInMonths < 12 ? 'Gato gatito' : 'Gato adulto';
    }

    return pet.species;
  }, [pet]);

  const handleTitleOptionChange = (value: string) => {
    if (value === CUSTOM_TITLE_VALUE) {
      setTitle('');
      if (!nextDueDateTouched) {
        setNextDueDate('');
      }
      return;
    }

    setTitle(value);
    if (!nextDueDateTouched) {
      setNextDueDate(getSuggestedNextDueDate(eventDate, value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!eventDate) {
      setError('La fecha es obligatoria');
      return;
    }

    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    const baseEventData = {
      pet_id: petId,
      type,
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      next_due_date: nextDueDate || null,
      notes: notes.trim() || null,
    };
    const previousFileUrl = event?.file_url || null;
    const uploadedUrlsToCleanup: string[] = [];
    let fileUrl = removeExistingAttachment ? null : previousFileUrl;

    try {
      setLoading(true);
      let savedEvent: Event;

      if (!event) {
        setUploadProgress(attachmentFile ? 'Creando evento...' : 'Guardando evento...');
        savedEvent = await onSubmit(
          {
            ...baseEventData,
            file_url: null,
          },
          { mode: 'create' }
        );

        if (attachmentFile) {
          setUploadProgress('Subiendo imagen adjunta...');
          const compressed = await compressImage(attachmentFile, 1600);
          const uploadedUrl = await uploadEventAttachment(compressed, userId, savedEvent.id);
          if (!uploadedUrl) {
            throw new Error('Error al subir la imagen adjunta');
          }

          fileUrl = uploadedUrl;
          uploadedUrlsToCleanup.push(uploadedUrl);

          setUploadProgress('Guardando adjunto...');
          savedEvent = await onSubmit(
            {
              file_url: fileUrl,
            },
            { mode: 'update', eventId: savedEvent.id }
          );
        }

        await onSuccess?.(savedEvent);
        return;
      }

      if (attachmentFile) {
        setUploadProgress('Subiendo imagen adjunta...');
        const compressed = await compressImage(attachmentFile, 1600);
        const uploadedUrl = await uploadEventAttachment(compressed, userId, event.id);
        if (!uploadedUrl) {
          throw new Error('Error al subir la imagen adjunta');
        }

        fileUrl = uploadedUrl;
        uploadedUrlsToCleanup.push(uploadedUrl);
      }

      setUploadProgress('Guardando evento...');
      savedEvent = await onSubmit(
        {
          ...baseEventData,
          file_url: fileUrl,
        },
        { mode: 'update', eventId: event.id }
      );

      if ((attachmentFile || removeExistingAttachment) && previousFileUrl && previousFileUrl !== fileUrl) {
        setUploadProgress('Limpiando adjunto anterior...');
        const deleted = await deleteStorageFile(previousFileUrl);
        if (!deleted) {
          console.warn('No se pudo eliminar el adjunto anterior del evento');
        }
      }

      await onSuccess?.(savedEvent);
    } catch (err) {
      await Promise.all(
        uploadedUrlsToCleanup.map(async (url) => {
          if (url !== previousFileUrl) {
            await deleteStorageFile(url);
          }
        })
      );
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 rounded-2xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <p className="text-sm font-semibold text-gray-700">
          {eventIcons[type]} <span className="text-blue-600">Registrando:</span> {EVENT_TYPE_LABELS[type]}
        </p>
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Tipo de evento *</label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as EventType)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          {EVENT_TYPES.map((eventType) => (
            <option key={eventType} value={eventType}>
              {eventIcons[eventType]} {EVENT_TYPE_LABELS[eventType]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Título *</label>
        {type === 'otro' ? (
          <p className="ml-1 text-xs text-gray-500">Este tipo de evento usa un título personalizado.</p>
        ) : (
          <>
            {petContextLabel && (
              <p className="ml-1 text-xs text-blue-600">Opciones sugeridas para {petContextLabel}.</p>
            )}
            <select
              value={selectedTitle}
              onChange={(e) => handleTitleOptionChange(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="" disabled>
                Selecciona un título
              </option>
              {standardTitles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={CUSTOM_TITLE_VALUE}>Otro</option>
            </select>
          </>
        )}
        {showCustomTitleInput && (
          <Input
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              if (!nextDueDateTouched) {
                setNextDueDate(getSuggestedNextDueDate(eventDate, nextTitle));
              }
            }}
            placeholder="Escribe el título del evento"
            required
          />
        )}
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="Fecha del evento *"
          value={eventDate}
          onChange={(e) => {
            const nextEventDate = e.target.value;
            setEventDate(nextEventDate);
            if (!nextDueDateTouched) {
              setNextDueDate(getSuggestedNextDueDate(nextEventDate, title));
            }
          }}
          required
        />
        <p className="ml-1 text-xs text-gray-500">Cuando ocurrió o está programado.</p>
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles importantes del evento..."
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="ml-1 text-xs text-gray-500">Opcional. Agrega detalles importantes.</p>
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="Próxima dosis / revisión"
          value={nextDueDate}
          onChange={(e) => {
            setNextDueDate(e.target.value);
            setNextDueDateTouched(true);
          }}
        />
        <p className="ml-1 text-xs text-gray-500">
          Opcional. Se completa automáticamente para vacunas y controles estándar, pero puedes ajustarla.
        </p>
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Notas adicionales</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del veterinario, recomendaciones especiales..."
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-4 border-t-2 border-gray-100 pt-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Imagen adjunta</h3>
          <p className="mt-1 text-sm text-gray-500">
            Puedes adjuntar una imagen como certificado de vacunas, receta o indicación médica.
          </p>
        </div>

        {attachmentPreview && (
          <div className="relative inline-block">
            <Image
              src={attachmentPreview}
              alt="Adjunto del evento"
              width={160}
              height={160}
              className="h-40 w-40 rounded-2xl border-2 border-gray-200 object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => {
                setAttachmentFile(null);
                setAttachmentPreview(null);
                setRemoveExistingAttachment(Boolean(event?.file_url));
              }}
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
              aria-label="Quitar adjunto"
            >
              ×
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const validation = validateFile(file);
            if (!validation.valid) {
              setError(validation.error || 'Archivo inválido');
              return;
            }

            setAttachmentFile(file);
            setAttachmentPreview(URL.createObjectURL(file));
            setRemoveExistingAttachment(false);
            setError('');
          }}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:cursor-pointer file:rounded-xl file:border-2 file:border-emerald-200
            file:bg-gradient-to-r file:from-emerald-50 file:to-teal-50 file:px-6 file:py-3
            file:text-sm file:font-semibold file:text-emerald-700 file:transition-all
            hover:file:border-emerald-300 hover:file:bg-emerald-100"
        />
        <p className="text-xs text-gray-500">
          Solo imágenes JPG, PNG o WebP · Máximo 5 MB · Se comprime automáticamente antes de subir
        </p>
      </div>

      {uploadProgress && (
        <div className="animate-fade-in flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 font-medium text-blue-700">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className="animate-fade-in rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 font-medium text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="mt-8 w-full py-4 text-lg" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        ) : (
          <span>{submitLabel}</span>
        )}
      </Button>
    </form>
  );
}
