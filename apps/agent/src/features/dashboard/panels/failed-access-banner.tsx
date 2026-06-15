import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { useSettings } from '@/domain/settings-context';
import { dashboardService } from '../api/dashboard-service';
import type { FailedLoginRow } from '../domain/types';

/** §5 — son başarılı girişten sonra başarısız erişim varsa bilgilendirme. */
export function FailedAccessBanner() {
  const { t } = useTranslation();
  const { openSettings } = useSettings();
  const [rows, setRows] = useState<FailedLoginRow[]>([]);

  useEffect(() => {
    void dashboardService.getFailedLogins().then(setRows);
  }, []);

  if (rows.length === 0) return null;
  const latest = rows[0]!;

  return (
    <div className="banner banner-warn" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <ShieldAlert size={16} />
      <span style={{ flex: 1 }}>
        {t('ag_home_failed_access', { count: rows.length, when: latest.when, loc: latest.loc })}
      </span>
      <button type="button" className="link-btn" onClick={() => openSettings('failed')}>
        {t('ag_home_failed_access_link')}
      </button>
    </div>
  );
}
