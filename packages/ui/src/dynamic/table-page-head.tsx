import * as React from 'react';
import {
  Columns3,
  Download,
  Plus,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { PageHead } from '../composite/page-head';
import { Button } from '../primitives/button';
import type {
  DynamicTableHeaderProps,
  TableConfig,
  TablePermissions,
  ToolbarButtonConfig,
  TranslateFn,
} from './types';
import { canTableExport, canTableNew, canToolbarButton } from './table-permissions';

const TOOLBAR_ICONS: Record<string, LucideIcon> = {
  download: Download,
  plus: Plus,
  columns: Columns3,
  refresh: RefreshCw,
};

function ToolbarIcon({ name }: { name?: string }) {
  if (!name) return null;
  const Icon = TOOLBAR_ICONS[name.toLowerCase()];
  if (!Icon) return null;
  return <Icon size={14} />;
}

function mapButtonVariant(variant?: ToolbarButtonConfig['variant']) {
  switch (variant) {
    case 'primary':
      return 'primary' as const;
    case 'danger':
      return 'danger' as const;
    case 'ghost':
      return 'ghost' as const;
    default:
      return 'default' as const;
  }
}

export function TablePageHead({
  header,
  config,
  permissions,
  dataCount,
  loading,
  onExport,
  onNew,
  onCustomButton,
  t,
}: {
  header?: DynamicTableHeaderProps;
  config: TableConfig;
  permissions?: TablePermissions;
  dataCount: number;
  loading?: boolean;
  onExport: () => void;
  onNew?: () => void;
  onCustomButton: (btn: ToolbarButtonConfig) => void;
  t: TranslateFn;
}) {
  if (header?.hidePageHead || config.hideTitleBar) return null;

  const toolbar = config.toolbar;
  const title = header?.title ?? config.title;
  const subtitle = header?.subtitle;
  const status = header?.status;

  const showExport = canTableExport(permissions);
  const showNew = canTableNew(permissions) && onNew != null;

  const customButtons =
    toolbar?.customButtons?.filter((b) => canToolbarButton(permissions, b.permission)) ?? [];

  const exportLabel =
    toolbar?.export?.label ?? t('cust_export', 'Dışa Aktar');
  const newLabel = toolbar?.new?.label ?? t('chart_new_cust', 'Yeni');

  const hasActions =
    header?.leading ||
    header?.trailing ||
    showExport ||
    showNew ||
    customButtons.length > 0;

  return (
    <PageHead
      title={title}
      subtitle={subtitle}
      status={status}
      actions={
        hasActions ? (
          <>
            {header?.leading}
            {showExport && (
              <Button
                type="button"
                onClick={onExport}
                disabled={loading || dataCount === 0}
              >
                <Download size={14} />
                {exportLabel}
              </Button>
            )}
            {customButtons.map((b) => (
              <Button
                key={b.key}
                type="button"
                variant={mapButtonVariant(b.variant)}
                onClick={() => onCustomButton(b)}
                disabled={loading}
              >
                <ToolbarIcon name={b.icon} />
                {b.label}
              </Button>
            ))}
            {header?.trailing}
            {showNew && (
              <Button type="button" variant="primary" onClick={onNew} disabled={loading}>
                <Plus size={14} />
                {newLabel}
              </Button>
            )}
          </>
        ) : undefined
      }
    />
  );
}
