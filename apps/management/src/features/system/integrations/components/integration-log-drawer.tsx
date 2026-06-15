import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { IconButton } from '@epay/ui';
import type { IntegrationLogEntry } from '../domain/types';

type Props = { open: boolean; log: IntegrationLogEntry | null; onClose: () => void };

export function IntegrationLogDrawer({ open, log, onClose }: Props) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !log) return null;
  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="cust-drawer open" role="dialog" style={{ width: 'min(560px, 96vw)' }}>
        <div className="head">
          <h2 className="mono fs-14">{log.operation}</h2>
          <IconButton onClick={onClose} aria-label="close">
            <X size={16} />
          </IconButton>
        </div>
        <div className="body">
          <p className="fs-11 t-mute mono">{log.correlationId}</p>
          <h3 className="fs-12" style={{ marginTop: 12 }}>{t('int_log_request')}</h3>
          <pre className="mono fs-11" style={{ overflow: 'auto', maxHeight: 200 }}>
            {log.requestFull}
          </pre>
          <h3 className="fs-12" style={{ marginTop: 12 }}>{t('int_log_response')}</h3>
          <pre className="mono fs-11" style={{ overflow: 'auto', maxHeight: 200 }}>
            {log.responseFull}
          </pre>
        </div>
      </div>
    </>
  );
}
