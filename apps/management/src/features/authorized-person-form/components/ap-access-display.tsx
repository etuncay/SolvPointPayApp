import { useTranslation } from 'react-i18next';
import { Field, FormGrid, type CustomComponentProps } from '@epay/ui';

interface AccessInfo {
  lastLogin?: string;
  failedAttempts?: number;
  device?: string;
  ipLocation?: string;
}

export function APAccessDisplay({ allValues }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  const info: AccessInfo = {
    lastLogin: allValues?.lastLogin as string | undefined,
    failedAttempts: allValues?.failedAttempts as number | undefined,
    device: allValues?.device as string | undefined,
    ipLocation: allValues?.ipLocation as string | undefined,
  };

  return (
    <FormGrid>
      <Field label={tr ? 'Son Login' : 'Last login'} locked>
        <input
          className="input mono locked"
          value={info.lastLogin ? new Date(info.lastLogin).toLocaleString(tr ? 'tr-TR' : 'en-US') : '—'}
          readOnly
        />
      </Field>
      <Field label={tr ? 'Başarısız Teşebbüs' : 'Failed attempts'} locked>
        <input className="input mono locked" value={`${info.failedAttempts ?? 0} / 30`} readOnly />
      </Field>
      <Field label={tr ? 'Cihaz' : 'Device'} locked>
        <input className="input locked" value={info.device ?? '—'} readOnly />
      </Field>
      <Field label={tr ? 'IP / Lokasyon' : 'IP / Location'} locked>
        <input className="input mono locked fs-12" value={info.ipLocation ?? '—'} readOnly />
      </Field>
    </FormGrid>
  );
}
