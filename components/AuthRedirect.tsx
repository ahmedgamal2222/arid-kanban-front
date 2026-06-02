'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirects to `to` (relative) if a JWT token is found in localStorage. */
export default function AuthRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('arid_token')) {
      router.replace(to);
    }
  }, [router, to]);

  return null;
}
