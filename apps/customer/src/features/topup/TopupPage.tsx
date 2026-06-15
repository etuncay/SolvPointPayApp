import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { Trans, useTranslation } from 'react-i18next';

const STEPS = [1, 2, 3, 4] as const;

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano erişimi yoksa sessiz */
    }
  }

  return (
    <button
      type="button"
      className="icon-btn topup-copy-btn"
      title={copied ? t('topup_copied') : t('topup_copy')}
      aria-label={`${label}: ${t('topup_copy')}`}
      onClick={onCopy}
    >
      <Icon name="copy" style={{ width: 16, height: 16 }} />
    </button>
  );
}

function InstructionRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="topup-instruction-row">
      <div style={{ minWidth: 0 }}>
        <div className="topup-instruction-label">{label}</div>
        <div className="topup-instruction-value tnum">{value}</div>
      </div>
      {copyable && <CopyValueButton value={value} label={label} />}
    </div>
  );
}

export function TopupPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['topup'],
    queryFn: () => customerPortalApi.getTopupInstructions(),
  });

  if (isLoading || !data) {
    return (
      <div className="page topup-page">
        <div className="container" />
      </div>
    );
  }

  return (
    <div className="page topup-page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('topup_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('topup_title')}
            </h1>
            <p className="page-sub">
              <Trans i18nKey="topup_subtitle" components={{ strong: <strong /> }} />
            </p>
          </div>
        </div>

        <AlertBanner tone="info" icon="info">
          <Trans i18nKey="topup_info_banner" components={{ strong: <strong /> }} />
        </AlertBanner>

        <div className="topup-grid">
          <div className="topup-steps">
            {STEPS.map((n) => (
              <div key={n} className="card topup-step">
                <span className="topup-step-num">{n}</span>
                <div>
                  <div className="topup-step-title">{t(`topup_step${n}_title`)}</div>
                  <div className="topup-step-desc">{t(`topup_step${n}_desc`)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad topup-instruction-card">
            <div className="topup-instruction-head">
              <span className="topup-instruction-icon" aria-hidden>
                <Icon name="bank" style={{ width: 22, height: 22 }} />
              </span>
              <strong style={{ fontSize: 16 }}>{t('topup_instruction_title')}</strong>
            </div>

            <InstructionRow label={t('topup_label_company')} value={data.companyName} />
            <InstructionRow label={t('topup_label_bank')} value={data.companyBank} />
            <InstructionRow
              label={t('topup_label_iban')}
              value={data.companyIban}
              copyable
            />
            <InstructionRow
              label={t('topup_label_reference')}
              value={data.customerReference}
              copyable
            />

            <p className="topup-instruction-footer">{data.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
