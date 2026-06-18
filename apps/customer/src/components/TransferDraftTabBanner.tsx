import { useTranslation } from 'react-i18next';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/Button';
import { useTransferDraft } from '@/app/TransferDraftContext';

/** Başka sekmede aktif transfer taslağı — uyarı ve yerel taslağı temizleme. */
export function TransferDraftTabBanner() {
  const { t } = useTranslation();
  const { transferTabConflict, releaseLocalDraft } = useTransferDraft();

  if (!transferTabConflict) return null;

  return (
    <div className="container" style={{ paddingTop: 12, paddingBottom: 0 }}>
      <AlertBanner tone="warn" icon="warn">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span>{t('transfer_draft_tab_warning')}</span>
          <Button type="button" variant="ghost" onClick={() => releaseLocalDraft()}>
            {t('transfer_draft_tab_dismiss')}
          </Button>
        </div>
      </AlertBanner>
    </div>
  );
}
