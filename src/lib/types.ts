export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Species = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otro';

export type Pet = {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed: string | null;
  birth_date: string | null;
  weight: number | null;
  photo_url: string | null;
  license_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventType = 'vacuna' | 'visita' | 'medicina' | 'otro';

export type Event = {
  id: string;
  pet_id: string;
  type: EventType;
  title: string;
  description: string | null;
  event_date: string;
  next_due_date: string | null;
  notes: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedbackType = 'bug' | 'mejora';

export type FeedbackStatus = 'nuevo' | 'en_revision' | 'resuelto';

export type Feedback = {
  id: string;
  user_id: string;
  user_email: string;
  type: FeedbackType;
  title: string;
  message: string;
  image_url: string | null;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
};

export type BetaAccessRequestStatus = 'nuevo' | 'contactado' | 'aprobado' | 'rechazado';

export type BetaAccessRequest = {
  id: string;
  email: string;
  email_normalized: string;
  full_name: string;
  reason: string;
  source: string;
  status: BetaAccessRequestStatus;
  request_count: number;
  last_requested_at: string;
  approved_at: string | null;
  approved_by_email: string | null;
  invited_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TutorProfile = {
  user_id: string;
  full_name: string;
  phone: string;
  city: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TutorProfileInput = {
  full_name: string;
  phone: string;
  city: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
};

export type AuthUser = {
  id: string;
  email: string | undefined;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
};

export type PetShareLinkResponse = {
  shareUrl: string;
  expiresAt: string;
};
