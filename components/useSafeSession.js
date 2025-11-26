'use client';

import { useState, useEffect } from 'react';

export function useSafeSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session');
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
  }, []);

  return { session, loading };
}