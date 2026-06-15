import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PageHead } from '@epay/ui';
import {
  RISK_PATH_SUB_ID,
  RISK_SUB_LABEL_KEYS,
  getRiskSectionNo,
  type RiskChildId,
} from './domain/nav-permissions';

export function RiskSectionPlaceholder() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const subId = RISK_PATH_SUB_ID[pathname] as RiskChildId | undefined;
  const labelKey = subId ? RISK_SUB_LABEL_KEYS[subId] : 'm_risk';
  const sectionNo = subId ? getRiskSectionNo(subId) : '7';

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
