'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { getAnalyticsMeasurementId, trackPageView } from '@/lib/analytics';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = getAnalyticsMeasurementId();

  useEffect(() => {
    if (!measurementId || !pathname) {
      return;
    }

    const query = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '';
    const url = query ? `${pathname}?${query}` : pathname;
    trackPageView(url);
  }, [measurementId, pathname]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
