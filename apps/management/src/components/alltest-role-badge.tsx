import { useTranslation } from 'react-i18next';

/** alltest hesabı veya etkin süper-rol — topbar / kullanıcı alanında gösterilir. */
export function AlltestRoleBadge({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <span
      className="badge warn"
      title={t('role_alltest_badge_title')}
      style={{
        fontSize: compact ? 10 : 10.5,
        marginLeft: compact ? 0 : 6,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
      }}
    >
      {t('role_alltest_badge')}
    </span>
  );
}
