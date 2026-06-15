import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input, DynamicTable, type TableCustomFunctions } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { settingsService } from '../api/settings-service';
import { AGENT_GLOBAL_DAILY_LIMIT } from '../api/agent-settings-store';
import { buildUsersTableConfig } from '../settings-table-config';

/** 1.3 › Kullanıcı Yönetimi — DynamicTable + JSON config. */
export function UsersTab() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const [listVersion, setListVersion] = useState(0);
  const refresh = () => setListVersion((v) => v + 1);

  const tableConfig = useMemo(
    () => buildUsersTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, listVersion],
  );

  const onLimit = (id: number, raw: string) => {
    const limit = Number(raw);
    if (!Number.isFinite(limit) || limit < 0) return;
    const result = settingsService.updateUserLimit(id, limit);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    refresh();
  };

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderUserLimit: (val: unknown, row: Record<string, unknown>) => (
        <Input
          type="number"
          defaultValue={Number(val)}
          onBlur={(e) => onLimit(Number(row.id), e.target.value)}
          style={{ maxWidth: 130 }}
        />
      ),
      renderUserStatus: (val: unknown) => (val ? t('ag_us_active') : t('ag_us_inactive')),
    }),
    [t],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="t-mute" style={{ fontSize: 11.5 }}>
        {t('ag_us_limit_hint', { limit: fmtNumber(AGENT_GLOBAL_DAILY_LIMIT, i18n.language) })}
      </p>
      <DynamicTable
        config={tableConfig}
        permissions={{}}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
      />
    </div>
  );
}
