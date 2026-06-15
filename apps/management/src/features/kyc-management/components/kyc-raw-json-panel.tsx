import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';
import { FormCard } from '@epay/ui';

type Props = { rawJson: unknown };

export function KycRawJsonPanel({ rawJson }: Props) {
  const { t } = useTranslation();
    return (
    <div style={{ marginTop: 16 }}>
    <FormCard title={t('kyc_panel_raw')} icon={<Code size={13} />}>
      <pre
        className="mono fs-11"
        style={{
          margin: 0,
          padding: 14,
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-subtle)',
          overflow: 'auto',
          maxHeight: 320,
        }}
      >
        {JSON.stringify(rawJson, null, 2)}
      </pre>
    </FormCard>
    </div>
  );
}
