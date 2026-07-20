'use client';

import { useState, useEffect, startTransition } from 'react';
import { api } from '@/lib/api';

const CACHE_KEY = 'logo_kud_url';

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) startTransition(() => setLogoUrl(cached));
    api.pengaturan.get()
      .then((d) => {
        if (d.logo_kud) {
          localStorage.setItem(CACHE_KEY, d.logo_kud);
          startTransition(() => setLogoUrl(d.logo_kud));
        }
      })
      .catch(() => {});
  }, []);

  return logoUrl;
}
