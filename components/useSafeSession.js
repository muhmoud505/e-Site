'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useSafeSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/auth/session?ts=${Date.now()}`, { cache: 'no-store' });
        const sessionData = await response.json();
        setSession(sessionData);
      } catch (error) {
        console.error('Error fetching session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [pathname]);

  return { session, loading };
}