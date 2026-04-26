import Image from 'next/image';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import {
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_COLORS,
  FEEDBACK_TYPE_LABELS,
} from '@/lib/constants';
import { Feedback } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <article className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_TYPE_COLORS[feedback.type]}`}
        >
          {FEEDBACK_TYPE_LABELS[feedback.type]}
        </span>
        <span
          className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_STATUS_COLORS[feedback.status]}`}
        >
          {FEEDBACK_STATUS_LABELS[feedback.status]}
        </span>
        <span className="text-sm text-gray-500">{formatDateTime(feedback.created_at)}</span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-gray-900">{feedback.title}</h3>
      <p className="whitespace-pre-wrap text-gray-600">{feedback.message}</p>

      {feedback.image_url && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <ImageIcon className="h-4 w-4" />
            <span>Imagen adjunta</span>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-xl border border-blue-100 bg-white">
              <Image
                src={feedback.image_url}
                alt={`Adjunto de feedback: ${feedback.title}`}
                width={112}
                height={112}
                className="h-28 w-28 object-cover"
                unoptimized
              />
            </div>
            <a
              href={feedback.image_url}
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
    </article>
  );
}
