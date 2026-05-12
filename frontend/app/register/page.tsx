'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The unified auth page now lives at /login and handles both login and register.
export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return null;
}
