export function trackRibaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, params || {});
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: eventName, ...(params || {}) });
    }
  } catch {}
}
