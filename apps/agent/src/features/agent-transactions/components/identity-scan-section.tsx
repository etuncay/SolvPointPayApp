import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FileText, Shield, XCircle } from 'lucide-react';
import { isIdentityTypeLocked } from '@/features/agent-transactions/domain/identity-rules';
import type { IdentityScanState } from '@/features/withdrawal/domain/types';
import './identity-scan.css';

export interface IdentityDocPayload {
  frontFile: string;
  backFile: string;
}

interface Props {
  value: IdentityScanState;
  onChange: (next: IdentityScanState) => void;
  onDocsUploaded: (payload: IdentityDocPayload) => void;
  ocrStatus: 'idle' | 'ok' | 'mismatch';
}

const COUNTRIES = [
  { value: 'TUR', labelKey: 'ag_wd_country_tur' },
  { value: 'DEU', labelKey: 'ag_wd_country_deu' },
  { value: 'SYR', labelKey: 'ag_wd_country_syr' },
  { value: 'USA', labelKey: 'ag_wd_country_usa' },
];

const ID_TYPES = [
  { value: 'IdentityCard', labelKey: 'ag_wd_idtype_card' },
  { value: 'Passport', labelKey: 'ag_wd_idtype_passport' },
  { value: 'ResidencePermit', labelKey: 'ag_wd_idtype_residence' },
];

function boxClass(done: boolean, active: boolean): string {
  const parts = ['id-scan-box'];
  if (done) parts.push('id-scan-box--done');
  else if (active) parts.push('id-scan-box--active');
  return parts.join(' ');
}

/** Kimlik belgesi ön/arka tarama — referans tasarım (6.para-transferi.md §5). */
export function IdentityScanSection({ value, onChange, onDocsUploaded, ocrStatus }: Props) {
  const { t } = useTranslation();
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const typeLocked = isIdentityTypeLocked(value.country);

  const frontDone = Boolean(value.frontFile);
  const backDone = Boolean(value.backFile);
  const frontActive = !frontDone;
  const backActive = frontDone && !backDone;

  const handleCountry = (country: string) => {
    onChange({ ...value, country, idType: isIdentityTypeLocked(country) ? 'IdentityCard' : value.idType });
  };

  const pickFile = (side: 'front' | 'back', file: File | undefined) => {
    if (!file) return;
    const name = file.name;
    if (side === 'front') {
      const next = { ...value, frontFile: name };
      onChange(next);
      if (next.backFile) onDocsUploaded({ frontFile: name, backFile: next.backFile });
    } else {
      const next = { ...value, backFile: name };
      onChange(next);
      if (next.frontFile) onDocsUploaded({ frontFile: next.frontFile, backFile: name });
    }
  };

  return (
    <section className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-head" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
        <span
          className="card-icon info"
          style={{
            width: 26,
            height: 26,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            background: 'color-mix(in oklch, var(--accent, #0d9488) 12%, transparent)',
            color: 'var(--accent, #0d9488)',
          }}
        >
          <Shield size={13} />
        </span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, flex: 1 }}>{t('ag_tr_id_scan')}</h3>
        {frontDone && backDone && ocrStatus === 'ok' ? (
          <span className="badge badge--success" style={{ fontSize: 10 }}>
            <Check size={11} /> {t('ag_tr_id_ocr_ok')}
          </span>
        ) : null}
      </div>

      <div className="fcard-body">
        <p className="t-mute fs-12" style={{ marginTop: 0, marginBottom: 14 }}>
          {t('ag_tr_id_scan_hint')}
        </p>

        <div className="id-scan-grid">
          <div
            role="button"
            tabIndex={0}
            className={boxClass(frontDone, frontActive)}
            onClick={() => !frontDone && frontRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !frontDone && frontRef.current?.click()}
          >
            <input
              ref={frontRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => pickFile('front', e.target.files?.[0])}
            />
            {frontDone ? (
              <>
                <Check size={20} strokeWidth={2.5} />
                <span className="id-scan-label">{t('ag_tr_id_front')}</span>
                <span>{t('ag_tr_id_scanned')} ✓</span>
                <span className="t-mute fs-11 mono" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {value.frontFile}
                </span>
              </>
            ) : (
              <>
                <div className="id-scan-thumb" aria-hidden />
                <FileText size={18} style={{ opacity: 0.35 }} />
                <span className="id-scan-label">{t('ag_tr_id_front')}</span>
                <span>{t('ag_tr_id_scan_drop')}</span>
              </>
            )}
          </div>

          <div
            role="button"
            tabIndex={0}
            className={boxClass(backDone, backActive)}
            onClick={() => !backDone && backRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !backDone && backRef.current?.click()}
          >
            <input
              ref={backRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => pickFile('back', e.target.files?.[0])}
            />
            {backDone ? (
              <>
                <Check size={20} strokeWidth={2.5} />
                <span className="id-scan-label">{t('ag_tr_id_back')}</span>
                <span>{t('ag_tr_id_scanned')} ✓</span>
                <span className="t-mute fs-11 mono" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {value.backFile}
                </span>
              </>
            ) : (
              <>
                <div className="id-scan-thumb" aria-hidden />
                <FileText size={18} style={{ opacity: 0.35 }} />
                <span className="id-scan-label">{t('ag_tr_id_back')}</span>
                <span>{t('ag_tr_id_scan_drop')}</span>
              </>
            )}
          </div>
        </div>

        <div className="id-scan-meta">
          <label className="field">
            <span className="field-label">{t('ag_wd_identity_country')}</span>
            <select className="input" value={value.country} onChange={(e) => handleCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(c.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">{t('ag_wd_identity_type')}</span>
            <select
              className="input"
              value={value.idType}
              disabled={typeLocked}
              onChange={(e) => onChange({ ...value, idType: e.target.value })}
            >
              {ID_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
            {typeLocked ? <span className="t-mute fs-11">{t('ag_wd_identity_type_locked')}</span> : null}
          </label>
          <label className="field">
            <span className="field-label">{t('ag_wd_identity_birth_date')}</span>
            <input
              type="date"
              className="input"
              value={value.birthDate}
              onChange={(e) => onChange({ ...value, birthDate: e.target.value })}
            />
          </label>
        </div>

        {ocrStatus === 'mismatch' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#991b1b' }}>
            <XCircle size={15} />
            <span className="fs-12">{t('ag_tr_err_ocr_mismatch')}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
