import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, FormCard, FormGrid } from '@epay/ui';
import type { DmsDocumentDetail } from '../domain/types';

type Props = {
  detail: DmsDocumentDetail;
  onDownload: () => { ok: true; blob: Blob; fileName: string } | { ok: false; error: string } | null;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function FilePanel({ detail, onDownload }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const hashShort =
    detail.fileHash && detail.fileHash.length > 16
      ? `${detail.fileHash.slice(0, 16)}…`
      : detail.fileHash ?? '—';

  const handleCopyHash = async () => {
    if (!detail.fileHash) return;
    try {
      await navigator.clipboard.writeText(detail.fileHash);
      setCopied(true);
      toast.success(t('dd_hash_copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('dd_hash_copy_failed'));
    }
  };

  const handleDownload = () => {
    const result = onDownload();
    if (!result) return;
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('dd_download_ok'));
  };

  return (
    <FormCard title={t('scf_doc_name')}>
      <FormGrid>
        <Field label={t('dd_file_name')}>
          <span className="fs-12 mono">{detail.fileName}</span>
        </Field>
        <Field label={t('dd_file_size')}>
          <span className="fs-12">{formatBytes(detail.fileSizeBytes)}</span>
        </Field>
        <Field label={t('dd_file_type')}>
          <span className="fs-12">{detail.fileType}</span>
        </Field>
        <Field label="SHA-256">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="fs-12 mono" title={detail.fileHash ?? undefined}>
              {hashShort}
            </span>
            {detail.fileHash && (
              <Button type="button" variant="ghost" onClick={() => void handleCopyHash()}>
                <Copy size={14} /> {copied ? t('dd_copied') : t('dd_copy')}
              </Button>
            )}
          </div>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 16 }}>
        <Button
          type="button"
          variant="primary"
          disabled={!detail.canDownload}
          title={!detail.canDownload ? t('dd_download_not_allowed') : undefined}
          onClick={handleDownload}
        >
          <Download size={14} /> {t('dd_download')}
        </Button>
      </div>
    </FormCard>
  );
}
