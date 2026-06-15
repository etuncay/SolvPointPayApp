import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button, Field } from '@epay/ui';
import type { DocumentUploadInput } from '../domain/types';

const LEGAL_ENTITY_TYPES = [
  'TradeRegistryGazette',
  'TaxCertificate',
  'ArticlesOfAssociation',
  'SignatureCircular',
  'CorporateAddressProof',
  'UltimateBeneficialOwnerDeclaration',
  'SanctionsComplianceForm',
  'ChamberOfCommerceCertificate',
  'CompanyRegistrationCertificate',
  'BoardResolution',
  'AuthorizedRepresentativeProof',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (doc: DocumentUploadInput) => void;
};

export function DocUploadModal({ open, onClose, onSubmit }: Props) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  const [type, setType] = useState(LEGAL_ENTITY_TYPES[0]!);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validTo, setValidTo] = useState('');

  if (!open) return null;

  const handleAdd = () => {
    if (!validTo) return;
    onSubmit({ category: 'LegalEntity', type, validFrom, validTo });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{tr ? 'Belge Yükle' : 'Upload document'}</h2>
          <p>{tr ? 'Tüzel müşteri dosyasına eklenecek belgeyi seçin.' : 'Pick a legal entity document.'}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={tr ? 'Belge Kategorisi' : 'Category'} required>
            <select className="select" value="LegalEntity" disabled>
              <option>LegalEntity</option>
            </select>
          </Field>
          <Field label={tr ? 'Belge Türü' : 'Type'} required>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              {LEGAL_ENTITY_TYPES.map((docType) => (
                <option key={docType} value={docType}>
                  {docType}
                </option>
              ))}
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
                PDF, JPG, PNG · max 10 MB
              </div>
            </div>
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {tr ? 'Vazgeç' : 'Cancel'}
          </Button>
          <Button type="button" variant="primary" onClick={handleAdd} disabled={!validTo}>
            {tr ? 'Ekle' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
