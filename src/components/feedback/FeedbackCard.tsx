import { FEEDBACK_STATUS_COLORS, FEEDBACK_STATUS_LABELS, FEEDBACK_TYPE_COLORS, FEEDBACK_TYPE_LABELS } from '@/lib/constants';
import { Feedback } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <article className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_TYPE_COLORS[feedback.type]}`}>
          {FEEDBACK_TYPE_LABELS[feedback.type]}
        </span>
        <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_STATUS_COLORS[feedback.status]}`}>
          {FEEDBACK_STATUS_LABELS[feedback.status]}
        </span>
        <span className="text-sm text-gray-500">{formatDateTime(feedback.created_at)}</span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-gray-900">{feedback.title}</h3>
      <p className="whitespace-pre-wrap text-gray-600">{feedback.message}</p>
    </article>
  );
}
