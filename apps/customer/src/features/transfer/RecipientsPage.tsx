import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerPortalApi, type SavedRecipient } from '@epay/data';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/icons/Icon';
import { firstFreeTextError } from '@/lib/validators';
import { PAYMENT_PURPOSES, paymentPurposeI18nKey, COUNTRIES } from '@/lib/enums';

type RecipientForm = {
  label: string;
  name: string;
  country: string;
  isIntl: boolean;
  phone: string;
  email: string;
  customerNo: string;
  purpose: string;
};

const emptyForm = (): RecipientForm => ({
  label: '',
  name: '',
  country: 'Türkiye',
  isIntl: false,
  phone: '',
  email: '',
  customerNo: '',
  purpose: PAYMENT_PURPOSES[0],
});

function recipientInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function RecipientCard({
  recipient: r,
  onSend,
  onEdit,
  onDelete,
}: {
  recipient: SavedRecipient;
  onSend: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <article className="card card-pad recipient-card">
      <div className="recipient-card-head">
        <span
          className={`recipient-avatar ${r.isIntl ? 'recipient-avatar--intl' : 'recipient-avatar--domestic'}`}
          aria-hidden
        >
          {recipientInitials(r.name)}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="recipient-card-title">{r.label}</div>
          <div className="recipient-card-name">{r.name}</div>
        </div>
        <span className="tag recipient-country-tag">
          <Icon name={r.isIntl ? 'globe' : 'flag'} style={{ width: 13, height: 13 }} />
          {r.country}
        </span>
      </div>

      <div className="recipient-contact-lines">
        {r.phone && (
          <span className="recipient-contact-line">
            <Icon name="phone" style={{ width: 14, height: 14, color: 'var(--faint)' }} />
            {r.phone}
          </span>
        )}
        {r.email && (
          <span className="recipient-contact-line">
            <Icon name="mail" style={{ width: 14, height: 14, color: 'var(--faint)' }} />
            {r.email}
          </span>
        )}
      </div>

      <div className="recipient-card-actions">
        <Button variant="primary" onClick={onSend}>
          <Icon name="send" /> {t('recipients_send')}
        </Button>
        <button
          type="button"
          className="icon-btn"
          title={t('recipients_edit')}
          aria-label={t('recipients_edit')}
          onClick={onEdit}
        >
          <Icon name="edit" style={{ width: 18, height: 18 }} />
        </button>
        <button
          type="button"
          className="icon-btn"
          title={t('recipients_delete')}
          aria-label={t('recipients_delete')}
          onClick={onDelete}
        >
          <Icon name="trash" style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </article>
  );
}

export function RecipientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => customerPortalApi.listRecipients(),
  });

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedRecipient | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipientForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyForm());
    setFormError(null);
    setEditId(null);
    setModal('add');
  }

  function openEdit(r: SavedRecipient) {
    setForm({
      label: r.label,
      name: r.name,
      country: r.country,
      isIntl: r.isIntl,
      phone: r.phone ?? '',
      email: r.email ?? '',
      customerNo: r.customerNo ?? '',
      purpose: r.purpose ?? PAYMENT_PURPOSES[0],
    });
    setEditId(r.id);
    setFormError(null);
    setModal('edit');
  }

  async function save() {
    const sensitiveErr = firstFreeTextError(form.label, form.name);
    if (sensitiveErr) {
      setFormError(t(sensitiveErr));
      return;
    }
    setFormError(null);
    if (modal === 'add') {
      await customerPortalApi.createRecipient(form);
    } else if (editId) {
      await customerPortalApi.updateRecipient(editId, form);
    }
    await qc.invalidateQueries({ queryKey: ['recipients'] });
    setModal(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await customerPortalApi.deleteRecipient(deleteTarget.id);
    await qc.invalidateQueries({ queryKey: ['recipients'] });
    setDeleteTarget(null);
  }

  function send(r: SavedRecipient) {
    const path = r.isIntl || r.country !== 'Türkiye' ? '/send/intl' : '/send/domestic';
    navigate(path, {
      state: {
        prefill: {
          recipientName: r.name,
          phone: r.phone,
          email: r.email,
          country: r.country,
          purpose: r.purpose,
          customerNo: r.customerNo,
        },
      },
    });
  }

  const canSave = Boolean(form.label.trim() && form.name.trim());

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('recipients_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('recipients_title')}
            </h1>
            <p className="page-sub">
              <Trans i18nKey="recipients_subtitle" components={{ strong: <strong /> }} />
            </p>
          </div>
          <Button variant="primary" onClick={openAdd}>
            <Icon name="plus" style={{ width: 18, height: 18 }} /> {t('recipients_add')}
          </Button>
        </div>

        <div className="recipients-grid">
          {recipients.map((r) => (
            <RecipientCard
              key={r.id}
              recipient={r}
              onSend={() => send(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => setDeleteTarget(r)}
            />
          ))}
        </div>

        {recipients.length === 0 && (
          <div className="empty">{t('recipients_empty')}</div>
        )}
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)} max={520}>
          <h3 style={{ fontSize: 21, marginBottom: 4 }}>
            {modal === 'add' ? t('recipients_modal_add_title') : t('recipients_modal_edit_title')}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>
            {t('recipients_modal_hint')}
          </p>
          {formError ? (
            <p style={{ color: 'var(--neg)', fontSize: 13.5, marginBottom: 12 }}>{formError}</p>
          ) : null}
          <div className="form-grid">
            <Field label={t('recipients_field_label')} required full>
              <input
                className="input"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder={t('recipients_field_label_ph')}
              />
            </Field>
            <Field label={t('recipients_field_name')} required full>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label={t('recipients_field_country')} required>
              <select
                className="select"
                value={form.country}
                onChange={(e) =>
                  setForm({
                    ...form,
                    country: e.target.value,
                    isIntl: e.target.value !== 'Türkiye',
                  })
                }
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('recipients_field_customer_no')}>
              <input
                className="input"
                value={form.customerNo}
                onChange={(e) => setForm({ ...form, customerNo: e.target.value })}
                placeholder={t('recipients_field_optional')}
              />
            </Field>
            <Field label={t('recipients_field_phone')}>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label={t('recipients_field_email')}>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label={t('recipients_field_purpose')} full>
              <select
                className="select"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              >
                {PAYMENT_PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {t(paymentPurposeI18nKey(p))}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('recipients_cancel')}
            </Button>
            <Button variant="primary" disabled={!canSave} onClick={save}>
              <Icon name="check" /> {t('recipients_save')}
            </Button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} max={400}>
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'var(--neg-soft)',
                color: 'var(--neg)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
              aria-hidden
            >
              <Icon name="trash" style={{ width: 26, height: 26 }} />
            </span>
            <h3 style={{ fontSize: 20 }}>{t('recipients_delete_title')}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 24px' }}>
              <strong>{deleteTarget.label}</strong> {t('recipients_delete_body')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" block onClick={() => setDeleteTarget(null)}>
                {t('recipients_cancel')}
              </Button>
              <Button
                variant="primary"
                block
                style={{ background: 'var(--neg)', borderColor: 'var(--neg)' }}
                onClick={confirmDelete}
              >
                {t('recipients_delete_confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
