import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';

export interface ForbiddenPageProps {
  titleKey?: string;
  subtitleKey?: string;
  backTo?: string;
  backLabelKey?: string;
}

/** Yetkisiz erişim — route guard ve sayfa düzeyi için ortak görünüm. */
export function ForbiddenPage({
  titleKey = 'finrec_forbidden_title',
  subtitleKey = 'rm_forbidden',
  backTo = '/',
  backLabelKey = 'forbidden_back_home',
}: ForbiddenPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="empty-state" style={{ padding: 48 }}>
      <h3>{t(titleKey)}</h3>
      <p className="t-mute fs-12">{t(subtitleKey)}</p>
      <Button type="button" onClick={() => navigate(backTo)} style={{ marginTop: 16 }}>
        {t(backLabelKey)}
      </Button>
    </div>
  );
}
