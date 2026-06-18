import { useState } from 'react';
import { customerPortalApi } from '@epay/data';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { COMPLAINT_TYPES, complaintTypeI18nKey } from '@/lib/enums';
import { firstFreeTextError } from '@/lib/validators';
import { useTranslation } from 'react-i18next';

const emptyForm = () => ({
  subject: '',
  contactType: COMPLAINT_TYPES[0] as string,
  message: '',
  consent: false,
  files: [] as string[],
});

export function ComplaintPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [caseNo, setCaseNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid = form.subject.trim() && form.message.trim() && form.consent;

  function addMockFile() {
    setForm((f) => ({
      ...f,
      files: [...f.files, `belge-${f.files.length + 1}.pdf`],
    }));
  }

  function removeFile(index: number) {
    setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));
  }

  function clearForm() {
    setForm(emptyForm());
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sensitiveErr = firstFreeTextError(form.subject, form.message);
    if (sensitiveErr) {
      setError(t(sensitiveErr));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const row = await customerPortalApi.createSupportCase({
        type: form.contactType,
        reason: form.subject.trim(),
        message: form.message.trim(),
        consent: form.consent,
      });
      setCaseNo(row.caseNo);
    } finally {
      setSubmitting(false);
    }
  }

  if (caseNo) {
    return (
      <div className="page complaint-page">
        <div className="container">
          <div className="card complaint-success-card">
            <span className="complaint-success-icon" aria-hidden>
              <Icon name="check" style={{ width: 38, height: 38 }} />
            </span>
            <h1 style={{ fontSize: 25 }}>{t('complaint_success_title')}</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '10px 0 18px' }}>
              {t('complaint_success_body')}{' '}
              <strong className="tnum" style={{ color: 'var(--ink)' }}>
                {caseNo}
              </strong>
              . {t('complaint_success_followup')}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setCaseNo(null);
                clearForm();
              }}
            >
              {t('complaint_new')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page complaint-page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('complaint_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('complaint_title')}
            </h1>
            <p className="page-sub">{t('complaint_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card card-pad complaint-form-card">
          {error && (
            <AlertBanner tone="error" icon="warn">
              {error}
            </AlertBanner>
          )}

          <div className="form-grid">
            <Field label={t('complaint_subject')} required full>
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={t('complaint_subject_ph')}
              />
            </Field>
            <Field label={t('complaint_contact_type')} required full>
              <select
                className="select"
                value={form.contactType}
                onChange={(e) => setForm({ ...form, contactType: e.target.value })}
              >
                {COMPLAINT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {t(complaintTypeI18nKey(c))}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t('complaint_message')}
              required
              hint={t('complaint_message_hint')}
              full
            >
              <textarea
                className="textarea"
                style={{ minHeight: 140 }}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t('complaint_message_ph')}
              />
            </Field>
          </div>

          <div>
            <Button type="button" variant="ghost" onClick={addMockFile}>
              <Icon name="clip" /> {t('complaint_add_file')}
            </Button>
            {form.files.length > 0 && (
              <div className="complaint-file-tags">
                {form.files.map((fl, i) => (
                  <span key={fl} className="tag complaint-file-tag">
                    <Icon name="receipt" style={{ width: 13, height: 13 }} />
                    {fl}
                    <button
                      type="button"
                      className="complaint-file-remove"
                      aria-label={t('complaint_remove_file')}
                      onClick={() => removeFile(i)}
                    >
                      <Icon name="close" style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="complaint-consent-box">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              <span className="checkbox-label">{t('complaint_consent')}</span>
            </label>
            <p className="complaint-consent-note">{t('complaint_consent_note')}</p>
          </div>

          <div className="complaint-actions">
            <Button type="button" variant="ghost" onClick={clearForm}>
              {t('complaint_clear')}
            </Button>
            <Button type="submit" variant="primary" disabled={!valid || submitting}>
              <Icon name="send" /> {t('complaint_submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
