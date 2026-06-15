import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button, Field } from '@epay/ui';
import type { DocumentUploadInput } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (doc: DocumentUploadInput) => void;
};

export function DocUploadModal({ open, onClose, onSubmit }: Props) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  const [category, setCategory] = useState('Identity');
  const [type, setType] = useState('TC Kimlik Kartı (Ön)');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validTo, setValidTo] = useState('');

  if (!open) return null;

  const handleAdd = () => {
    if (!validTo) return;
    onSubmit({ category, type, validFrom, validTo });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{tr ? 'Belge Yükle' : 'Upload document'}</h2>
          <p>{tr ? 'Müşteri dosyasına eklenecek belgeyi seçin.' : 'Pick a document to attach to the customer file.'}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={tr ? 'Belge Kategorisi' : 'Category'} required>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Identity</option>
              <option>AddressProof</option>
              <option>SourceOfFunds</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label={tr ? 'Belge Türü' : 'Type'} required>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>TC Kimlik Kartı (Ön)</option>
              <option>TC Kimlik Kartı (Arka)</option>
              <option>Pasaport</option>
              <option>İkametgah Belgesi</option>
              <option>Maaş Bordrosu</option>
            </select>
          </Field>
          <div className="fgrid cols-2" style={{ gap: 14 }}>
            <Field label={tr ? 'Geçerlilik Başlangıç' : 'Valid from'} required>
              <input className="input" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </Field>
            <Field label={tr ? 'Geçerlilik Bitiş' : 'Valid until'} required>
              <input className="input" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </Field>
          </div>
          <Field label={tr ? 'Dosya' : 'File'} required>
            <div
              style={{
                border: '2px dashed var(--line-strong)',
                borderRadius: 'var(--r-md)',
                padding: '20px 16px',
                textAlign: 'center',
                color: 'var(--fg-muted)',
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              <Download size={20} style={{ transform: 'rotate(180deg)', marginBottom: 6, opacity: 0.6 }} />
              <div>
                <strong style={{ color: 'var(--fg)' }}>{tr ? 'Sürükleyip bırakın' : 'Drag & drop'}</strong>{' '}
                {tr ? 'veya dosya seçin' : 'or browse'}
              </div>
              <div className="fs-11 t-mute" style={{ marginTop: 4 }}>
                PDF, JPG, PNG · {tr ? 'maks.' : 'max.'} 10MB
              </div>
            </div>
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>
            {tr ? 'İptal' : 'Cancel'}
          </Button>
          <Button type="button" variant="primary" onClick={handleAdd} disabled={!validTo}>
            {tr ? 'Ekle' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
