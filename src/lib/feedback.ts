import { FEEDBACK_TYPES } from './constants';
import { FeedbackType } from './types';

const MAX_FEEDBACK_TITLE_LENGTH = 120;
const MIN_FEEDBACK_TITLE_LENGTH = 4;
const MAX_FEEDBACK_MESSAGE_LENGTH = 1000;
const MIN_FEEDBACK_MESSAGE_LENGTH = 10;
const FEEDBACK_ATTACHMENT_BUCKET = 'pet-photos';

export type FeedbackInput = {
  type: FeedbackType;
  title: string;
  message: string;
  image_url?: string | null;
};

function isFeedbackType(value: unknown): value is FeedbackType {
  return typeof value === 'string' && FEEDBACK_TYPES.includes(value as FeedbackType);
}

function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAllowedFeedbackImageUrl(url: string, userId: string) {
  try {
    const parsed = new URL(url);
    const expectedSegment = `/${FEEDBACK_ATTACHMENT_BUCKET}/${userId}/`;
    return parsed.pathname.includes(expectedSegment);
  } catch {
    return false;
  }
}

export function validateFeedbackInput(
  input: Record<string, unknown>,
  userId?: string
): { success: true; data: FeedbackInput } | { success: false; error: string } {
  if (!isFeedbackType(input.type)) {
    return { success: false, error: 'Tipo de feedback inválido.' };
  }

  const title = sanitizeText(input.title);
  if (title.length < MIN_FEEDBACK_TITLE_LENGTH || title.length > MAX_FEEDBACK_TITLE_LENGTH) {
    return {
      success: false,
      error: 'El título debe tener entre 4 y 120 caracteres.',
    };
  }

  const message = sanitizeText(input.message);
  if (
    message.length < MIN_FEEDBACK_MESSAGE_LENGTH ||
    message.length > MAX_FEEDBACK_MESSAGE_LENGTH
  ) {
    return {
      success: false,
      error: 'El detalle debe tener entre 10 y 1000 caracteres.',
    };
  }

  const rawImageUrl = sanitizeText(input.image_url);
  const imageUrl = rawImageUrl || null;

  if (imageUrl && (!userId || !isAllowedFeedbackImageUrl(imageUrl, userId))) {
    return {
      success: false,
      error: 'La imagen adjunta no es válida para tu cuenta.',
    };
  }

  return {
    success: true,
    data: {
      type: input.type,
      title,
      message,
      image_url: imageUrl,
    },
  };
}
