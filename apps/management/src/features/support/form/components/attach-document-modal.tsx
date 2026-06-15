import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';
import { useRole } from '@/domain/role-context';

const MOCK_ATTACH_OPTIONS = [
  { id: 'DOC-DETAIL-003', label: 'DOC-DETAIL-003 — Ek belge' },
  { id: 'DOC-001', label: 'DOC-001 — Kimlik' },
  { id: 'DOC-002', label: 'DOC-002 — İkametgah' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onAttached: (documentId: string) => void;
};

export function AttachDocumentModal({ open, onClose, onAttached }: Props) {
  const { t } = useTranslation();
  const { role } = useRole();
  const [docId, setDocId] = useState(MOCK_ATTACH_OPTIONS[0]!.id);

  if (!open) return null;

  const handleAttach = () => {
    if (!documentsService.getById(role, docId)) return;
    onAttached(docId);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{t('scf_btn_attach')}</h3>
        <div style={{ marginTop: 16 }}>
          <Field label={t('scf_attach_select')}>
            <select className="select" value={docId} onChange={(e) => setDocId(e.target.value)}>
              {MOCK_ATTACH_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="fs-11 t-mute" style={{ marginTop: 8 }}>
          {t('scf_attach_hint')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('ib_cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleAttach}>
            {t('scf_attach_confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
