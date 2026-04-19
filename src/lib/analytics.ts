type AnalyticsValue = string | number | boolean | null | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function sanitizeParams(params?: Record<string, AnalyticsValue>) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
}

export function getAnalyticsMeasurementId() {
  return GA_MEASUREMENT_ID;
}

export function trackEvent(
  eventName: string,
  params?: Record<string, AnalyticsValue>
) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, sanitizeParams(params));
}

export function trackPageView(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export const analytics = {
  login(isDemo: boolean) {
    trackEvent('login', {
      method: isDemo ? 'demo' : 'password',
    });
  },

  signUp() {
    trackEvent('sign_up', {
      method: 'email',
    });
  },

  createPet(species: string, hasPhoto: boolean) {
    trackEvent('create_pet', {
      pet_species: species,
      has_photo: hasPhoto,
    });
  },

  createEvent(eventType: string, hasNextDueDate: boolean) {
    trackEvent('create_event', {
      event_type: eventType,
      has_next_due_date: hasNextDueDate,
    });
  },
};
