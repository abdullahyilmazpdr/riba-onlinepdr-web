'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Dakika
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 28. dakikada uyarı göster

export type TimedSessionKey = 'teacher_session' | 'admin_session';

export function touchSessionActivity(sessionKey: TimedSessionKey) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${sessionKey}_last_active`, String(Date.now()));
  } catch {}
}

export function clearSessionActivity(sessionKey: TimedSessionKey) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${sessionKey}_last_active`);
  } catch {}
}

interface InactivityConfig {
  sessionKey: TimedSessionKey;
  logoutRedirectUrl: string;
  enabled?: boolean;
  onLogout?: () => void;
}

export function useSessionTimeout({
  sessionKey,
  logoutRedirectUrl,
  enabled = true,
  onLogout,
}: InactivityConfig) {
  const warningShownRef = useRef(false);
  const expiredRef = useRef(false);
  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const activityKey = `${sessionKey}_last_active`;
    let lastWriteMs = 0;

    const handleExpire = () => {
      if (expiredRef.current) return;
      expiredRef.current = true;

      try {
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(activityKey);
        if (sessionKey === 'teacher_session') {
          localStorage.removeItem('teacher_session_token');
        } else {
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('admin_active_school_key');
          localStorage.removeItem('active_spreadsheet_id');
          localStorage.removeItem('sso_admin_session');
        }
      } catch {}

      toast.error(
        '30 dakika boyunca işlem yapmadığınız için oturumunuz güvenlik nedeniyle sonlandırıldı.',
        {
          duration: 4000,
          id: 'session-expired',
        }
      );

      if (onLogoutRef.current) {
        try {
          onLogoutRef.current();
        } catch {}
      }

      setTimeout(() => {
        window.location.href = logoutRedirectUrl;
      }, 1200);
    };

    const checkElapsed = () => {
      if (expiredRef.current) return;
      const storedLast = localStorage.getItem(activityKey);
      if (!storedLast) {
        touchSessionActivity(sessionKey);
        return;
      }
      const lastActive = parseInt(storedLast, 10);
      if (isNaN(lastActive)) {
        touchSessionActivity(sessionKey);
        return;
      }

      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        handleExpire();
        return;
      }

      if (elapsed > INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        toast('Hareketsizlik nedeniyle oturumunuz 2 dakika içinde sonlandırılacaktır.', {
          icon: '⚠️',
          duration: 8000,
          id: 'session-timeout-warning',
        });
      }
    };

    // Sayfa ilk açıldığında önceki sekmeden kalan >30 dk hareketsizlik varsa hemen yakala
    const initialStored = localStorage.getItem(activityKey);
    if (initialStored) {
      checkElapsed();
    } else {
      touchSessionActivity(sessionKey);
      lastWriteMs = Date.now();
    }

    const handleUserActivity = () => {
      if (expiredRef.current) return;
      const now = Date.now();
      warningShownRef.current = false;
      if (now - lastWriteMs >= 2000) {
        lastWriteMs = now;
        touchSessionActivity(sessionKey);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkElapsed();
      }
    };

    const events: Array<keyof WindowEventMap> = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(checkElapsed, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [sessionKey, logoutRedirectUrl, enabled]);
}
