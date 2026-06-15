import { useState, type ReactNode } from 'react';
import { Download, Filter, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import type { WidgetDef } from '../widget-registry';

export function FullscreenOverlay({
  widget,
  titleKey,
  onClose,
  onRefresh,
  onExportCsv,
  children,
}: {
  widget: WidgetDef;
  /** Varsayılan w_{id}; risk panelleri gibi özel başlık anahtarı */
  titleKey?: string;
  onClose: () => void;
  onRefresh: () => void;
  onExportCsv?: () => void;
  children: ReactNode | ((filterText: string) => ReactNode);
}) {
  const { t, i18n } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const body = typeof children === 'function' ? children(filterText) : children;

  return (
    <div
      className="fs-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="fs-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('lf_cancel_back')}>
          <X size={16} />
        </button>
        <h2>{t(titleKey ?? `w_${widget.id}`)}</h2>
        <div className="fs-tools">
          <Button variant="ghost" size="sm" onClick={() => setFilterOpen((v) => !v)}>
            <Filter size={14} /> {t('fs_filter')}
          </Button>
          {onExportCsv && (
            <Button variant="ghost" size="sm" onClick={onExportCsv}>
              <Download size={14} /> CSV
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw size={14} /> {t('refresh_all')}
          </Button>
        </div>
      </div>
      <div className="fs-body">
        {filterOpen && (
          <div style={{ maxWidth: 1400, margin: '0 auto 12px' }}>
            <input
              type="search"
              className="input"
              placeholder={t('fs_filter_ph')}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        )}
        <div className="card" style={{ maxWidth: 1400, margin: '0 auto' }}>
          {body}
        </div>
        <p className="fs-12 t-mute" style={{ textAlign: 'center', marginTop: 16 }}>
          {i18n.language === 'tr'
            ? 'Tam ekran görünümde sıralama, filtreleme ve sayfalama araçları kullanılabilir.'
            : 'Fullscreen view supports sorting, filtering and pagination tools.'}
        </p>
      </div>
    </div>
  );
}
