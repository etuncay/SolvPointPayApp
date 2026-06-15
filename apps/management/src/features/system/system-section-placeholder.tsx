import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PageHead } from '@epay/ui';
import {
  SYSTEM_SUB_LABEL_KEYS,
  getSystemSectionNo,
  getSystemViewMode,
  resolveSystemActiveSub,
  type SystemChildId,
} from './domain/nav-permissions';
import { useRole } from '@/domain/role-context';

type Props = {
  specNo?: string;
  titleKey?: string;
  viewMode?: 'full' | 'readonly';
};

export function SystemSectionPlaceholder({ specNo, titleKey, viewMode }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { role } = useRole();
  const subId = resolveSystemActiveSub(pathname) as SystemChildId | null;
  const labelKey = titleKey ?? (subId ? SYSTEM_SUB_LABEL_KEYS[subId] : 'm_system');
  const sectionNo = specNo ?? (subId ? getSystemSectionNo(subId) : '12');
  const mode = viewMode ?? getSystemViewMode(role);

  return (
    <>
      <PageHead
        title={t(labelKey)}
        subtitle={t('sys_stub_sub')}
        status={
          <span className="mono fs-11 t-mute">
            {sectionNo}
            {mode === 'readonly' ? ` · ${t('sys_view_readonly')}` : ''}
          </span>
        }
      />
      <div className="empty-state" style={{ padding: 48, marginTop: 24 }}>
        <p className="t-mute">{t('coming_soon')}</p>
      </div>
    </>
  );
}
