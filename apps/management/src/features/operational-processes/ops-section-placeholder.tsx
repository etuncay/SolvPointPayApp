import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PageHead } from '@epay/ui';
import {
  OPS_PATH_SUB_ID,
  OPS_SUB_LABEL_KEYS,
  getOpsSectionNo,
  type OpsChildId,
} from './domain/nav-permissions';

export function OpsSectionPlaceholder() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const subId = OPS_PATH_SUB_ID[pathname] as OpsChildId | undefined;
  const labelKey = subId ? OPS_SUB_LABEL_KEYS[subId] : 'm_ops';
  const sectionNo = subId ? getOpsSectionNo(subId) : '8';

  return (
    <>
      <PageHead
        title={t(labelKey)}
        subtitle={t('rc_stub_sub')}
        status={<span className="mono fs-11 t-mute">{sectionNo}</span>}
      />
      <div className="empty-state" style={{ padding: 48, marginTop: 24 }}>
        <p className="t-mute">{t('coming_soon')}</p>
      </div>
    </>
  );
}
