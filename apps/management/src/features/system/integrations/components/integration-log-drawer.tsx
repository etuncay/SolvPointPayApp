import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { IconButton, Switch } from '@epay/ui';
import { formatLogPayloadForDisplay } from '../domain/log-payload-display';
import type { IntegrationLogEntry } from '../domain/types';

type Props = { open: boolean; log: IntegrationLogEntry | null; onClose: () => void };

const preStyle: CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 'var(--r-md)',
  background: 'var(--bg-subtle)',
  overflow: 'auto',
  maxHeight: 200,
};

export function IntegrationLogDrawer({ open, log, onClose }: Props) {
  const { t } = useTranslation();
  const [developerMode, setDeveloperMode] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    setDeveloperMode(false);
  }, [log?.id, open]);

  if (!open || !log) return null;

  const requestBody = formatLogPayloadForDisplay({
    masked: log.requestMasked,
    full: log.requestFull,
    developerMode,
  });
  const responseBody = formatLogPayloadForDisplay({
    masked: log.responseMasked,
    full: log.responseFull,
    developerMode,
  });

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

          <label
            className="fs-12"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 14,
              marginBottom: 8,
              cursor: 'pointer',
            }}
          >
            <Switch
              checked={developerMode}
              onCheckedChange={setDeveloperMode}
              aria-label={t('int_log_dev_mode')}
            />
            <span>{t('int_log_dev_mode')}</span>
          </label>
          <p className="fs-11 t-mute" style={{ marginBottom: 12 }}>
            {developerMode ? t('int_log_dev_mode_warning') : t('int_log_dev_mode_hint')}
          </p>

          <h3 className="fs-12">
            {developerMode ? t('int_log_request_full') : t('int_log_request')}
          </h3>
          <pre className="mono fs-11 t-mute" style={preStyle}>
            {requestBody}
          </pre>

          <h3 className="fs-12" style={{ marginTop: 12 }}>
            {developerMode ? t('int_log_response_full') : t('int_log_response')}
          </h3>
          <pre className="mono fs-11 t-mute" style={preStyle}>
            {responseBody}
          </pre>
        </div>
      </div>
    </>
  );
}
