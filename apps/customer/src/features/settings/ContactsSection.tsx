import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerPortalApi, type ContactKind, type CustomerContact } from '@epay/data';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { OtpInput } from '@/components/ui/OtpInput';
import { DemoOtpHint } from '@/components/DemoOtpHint';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon, type IconName } from '@/components/icons/Icon';
import { isDemoMode } from '@/lib/data-layer';

type Draft = { id: string | null; kind: ContactKind; value: string };
type Flash = { tone: 'info' | 'error'; msg: string } | null;

const KIND_ICON: Record<ContactKind, IconName> = {
  email: 'mail',
  mobile: 'phone',
  landline: 'phone',
};

function VerifyModal({
  contact,
  onClose,
  onVerified,
}: {
  contact: CustomerContact;
  onClose: () => void;
  onVerified: () => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const isEmail = contact.kind === 'email';

  async function doResend() {
    setError(null);
    setInfo(null);
    const r = await customerPortalApi.resendContactVerification(contact.id);
    if (r.alreadyVerified) setInfo(t('settings_contact_already_verified'));
    else if (r.rateLimited) setError(t('settings_contact_rate_limited'));
    else setInfo(t('settings_verify_resent'));
  }

  async function doVerify() {
    setError(null);
    const submitted = isEmail ? '123456' : code;
    const r = await customerPortalApi.verifyContact(contact.id, submitted);
    if (!r.ok) {
      setError(t('settings_verify_failed'));
      return;
    }
    onVerified();
  }

  return (
    <Modal onClose={onClose} max={440}>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t('settings_verify_title')}</h2>
      <p className="hint" style={{ marginBottom: 16 }}>
        {isEmail
          ? t('settings_verify_email_desc', { value: contact.value })
          : t('settings_verify_phone_desc', { value: contact.value })}
      </p>

      {info ? (
        <div style={{ marginBottom: 12 }}>
          <AlertBanner tone="info" icon="check">
            {info}
          </AlertBanner>
        </div>
      ) : null}
      {error ? (
        <div style={{ marginBottom: 12 }}>
          <AlertBanner tone="error" icon="warn">
            {error}
          </AlertBanner>
        </div>
      ) : null}

      {!isEmail ? (
        <>
          <Field label={t('settings_verify_code_label')} required full>
            <OtpInput value={code} onChange={setCode} />
          </Field>
          <DemoOtpHint onUseCode={setCode} />
        </>
      ) : isDemoMode() ? (
        <>
          <p className="hint">{t('settings_verify_email_demo')}</p>
          <DemoOtpHint />
        </>
      ) : null}

      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={doResend}>
          <Icon name="refresh" style={{ width: 15, height: 15 }} /> {t('settings_verify_resend')}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t('settings_verify_cancel')}
        </Button>
        <Button
          variant="primary"
          disabled={!isEmail && code.length < 6}
          onClick={() => void doVerify()}
        >
          <Icon name="check" /> {t('settings_verify_submit')}
        </Button>
      </div>
    </Modal>
  );
}

export function ContactsSection() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => customerPortalApi.listContacts(),
  });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<CustomerContact | null>(null);
  const [flash, setFlash] = useState<Flash>(null);

  function showFlash(tone: 'info' | 'error', msg: string) {
    setFlash({ tone, msg });
    window.setTimeout(() => setFlash(null), 8000);
  }

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ['contacts'] });
  }

  async function saveDraft() {
    if (!draft || !draft.value.trim()) return;
    const isNew = draft.id == null;
    const saved = isNew
      ? await customerPortalApi.addContact({ kind: draft.kind, value: draft.value })
      : await customerPortalApi.updateContact(draft.id as string, draft.value);
    setDraft(null);
    await refresh();
    if (saved && !saved.verified && saved.kind !== 'landline') {
      setVerifyTarget(saved);
    } else if (!isNew) {
      showFlash('info', t('settings_contact_updated'));
    }
  }

  async function makePrimary(c: CustomerContact) {
    await customerPortalApi.setPrimaryContact(c.id);
    await refresh();
    showFlash('info', t('settings_contact_primary_changed'));
  }

  async function remove(c: CustomerContact) {
    await customerPortalApi.deleteContact(c.id);
    await refresh();
    showFlash('info', t('settings_contact_updated'));
  }

  async function resend(c: CustomerContact) {
    if (c.verified) {
      showFlash('info', t('settings_contact_already_verified'));
      return;
    }
    setVerifyTarget(c);
  }

  return (
    <div className="card card-pad settings-card">
      <div className="settings-card-head">
        <h3 className="card-title">{t('settings_contact_title')}</h3>
        <p className="settings-card-desc">{t('settings_contact_desc')}</p>
      </div>

      {flash ? (
        <div style={{ marginBottom: 12 }}>
          <AlertBanner
            tone={flash.tone}
            icon={flash.tone === 'info' ? 'check' : 'warn'}
            onClose={() => setFlash(null)}
          >
            {flash.msg}
          </AlertBanner>
        </div>
      ) : null}

      <div className="settings-contact-list">
        {contacts.map((c) =>
          draft && draft.id === c.id ? (
            <div key={c.id} className="settings-contact-edit">
              <input
                className="input"
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                type={c.kind === 'email' ? 'email' : 'tel'}
                autoFocus
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={t('settings_contact_save')}
                onClick={() => void saveDraft()}
              >
                <Icon name="check" />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={t('settings_verify_cancel')}
                onClick={() => setDraft(null)}
              >
                <Icon name="close" />
              </button>
            </div>
          ) : (
            <div key={c.id} className="settings-pref-row">
              <span className="settings-pref-icon">
                <Icon name={KIND_ICON[c.kind]} style={{ width: 18, height: 18 }} />
              </span>
              <div className="settings-pref-body">
                <div className="settings-pref-title">
                  {c.value}
                  {c.isPrimary ? (
                    <span className="pill pill-completed" style={{ marginLeft: 8, fontSize: 11 }}>
                      {t('settings_contact_primary')}
                    </span>
                  ) : null}
                </div>
                <div className="settings-pref-desc">
                  {c.kind === 'landline'
                    ? t('settings_contact_landline_note')
                    : c.verified
                      ? t('settings_verified')
                      : t('settings_contact_unverified')}
                </div>
              </div>

              <div className="settings-contact-actions">
                {c.verified ? (
                  <span className="pill pill-completed" style={{ fontSize: 11 }}>
                    <Icon name="check" style={{ width: 13, height: 13 }} /> {t('settings_verified')}
                  </span>
                ) : (
                  <Button variant="soft" onClick={() => setVerifyTarget(c)}>
                    {t('settings_contact_verify')}
                  </Button>
                )}
                {!c.verified ? (
                  <button
                    type="button"
                    className="icon-btn"
                    title={t('settings_contact_resend')}
                    aria-label={t('settings_contact_resend')}
                    onClick={() => void resend(c)}
                  >
                    <Icon name="refresh" />
                  </button>
                ) : null}
                {c.kind !== 'landline' && c.verified && !c.isPrimary ? (
                  <button type="button" className="btn btn-quiet" onClick={() => void makePrimary(c)}>
                    {t('settings_contact_make_primary')}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="icon-btn"
                  title={t('settings_contact_edit')}
                  aria-label={t('settings_contact_edit')}
                  onClick={() => setDraft({ id: c.id, kind: c.kind, value: c.value })}
                >
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title={t('settings_contact_delete')}
                  aria-label={t('settings_contact_delete')}
                  onClick={() => void remove(c)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ),
        )}

        {draft && draft.id === null ? (
          <div className="settings-contact-edit">
            <input
              className="input"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              type={draft.kind === 'email' ? 'email' : 'tel'}
              placeholder={
                draft.kind === 'email'
                  ? t('settings_contact_value_email_ph')
                  : t('settings_contact_value_phone_ph')
              }
              autoFocus
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={t('settings_contact_save')}
              onClick={() => void saveDraft()}
            >
              <Icon name="check" />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={t('settings_verify_cancel')}
              onClick={() => setDraft(null)}
            >
              <Icon name="close" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="settings-contact-add">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setDraft({ id: null, kind: 'email', value: '' })}
        >
          <Icon name="plus" /> {t('settings_contact_add_email')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setDraft({ id: null, kind: 'mobile', value: '' })}
        >
          <Icon name="plus" /> {t('settings_contact_add_mobile')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setDraft({ id: null, kind: 'landline', value: '' })}
        >
          <Icon name="plus" /> {t('settings_contact_add_landline')}
        </button>
      </div>

      {verifyTarget ? (
        <VerifyModal
          contact={verifyTarget}
          onClose={() => setVerifyTarget(null)}
          onVerified={() => {
            setVerifyTarget(null);
            void refresh();
            showFlash('info', t('settings_verified'));
          }}
        />
      ) : null}
    </div>
  );
}
