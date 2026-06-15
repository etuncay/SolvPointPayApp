import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { PageHead } from '@epay/ui';

export interface FeaturePlaceholderProps {
  titleKey: string;
  specNo?: string;
  backHref?: string;
  backLabelKey?: string;
}

/** Management modülleri — geçici stub ekran (playground hariç). */
export function FeaturePlaceholder({
  titleKey,
  specNo,
  backHref = '/',
  backLabelKey = 'page_title',
}: FeaturePlaceholderProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <>
      <PageHead
        title={t(titleKey)}
        subtitle={t('feature_placeholder_sub')}
        status={specNo ? <span className="mono fs-11 t-mute">{specNo}</span> : undefined}
      />
      <div className="empty-state" style={{ padding: 48, marginTop: 24 }}>
        <p className="t-mute">{t('coming_soon')}</p>
        <Link className="link fs-12" to={backHref}>
          {t(backLabelKey)}
        </Link>
        <p className="t-mute fs-11 mono" style={{ marginTop: 8 }}>
          {pathname}
        </p>
      </div>
    </>
  );
}

/** routes.tsx için kısa fabrika */
export function ph(
  titleKey: string,
  specNo?: string,
  backHref?: string,
  backLabelKey?: string,
): ReactElement {
  return (
    <FeaturePlaceholder
      titleKey={titleKey}
      specNo={specNo}
      backHref={backHref}
      backLabelKey={backLabelKey}
    />
  );
}
