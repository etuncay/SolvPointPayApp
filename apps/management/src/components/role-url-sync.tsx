import { useEffect } from 'react';
import { readDemoRoleFromUrl } from '@/domain/role-resolution';
import { useRole } from '@/domain/role-context';

/** ?demoRole= query → demo override (oturum açıkken); parametreyi URL'den kaldırır. */
export function RoleUrlSync() {
  const { accountRole, setDemoRole } = useRole();

  useEffect(() => {
    if (!accountRole || typeof window === 'undefined') return;

    const deprecated = new URLSearchParams(window.location.search).get('role');
    if (deprecated && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[role] ?role= devre dışı; ?demoRole= veya üst çubuk rol chip kullanın.');
    }

    const fromUrl = readDemoRoleFromUrl(window.location.search);
    if (!fromUrl) return;

    setDemoRole(fromUrl);
    const url = new URL(window.location.href);
    url.searchParams.delete('demoRole');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [accountRole, setDemoRole]);

  return null;
}
