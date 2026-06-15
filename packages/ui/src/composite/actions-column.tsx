import type { ColumnDef } from '@tanstack/react-table';
import { Check, Eye, Pencil, X } from 'lucide-react';
import { IconButton } from '../primitives/icon-button';

export type RowActionHandlers<T> = {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onRestore?: (row: T) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  showRestore?: (row: T) => boolean;
  showDelete?: (row: T) => boolean;
  labels?: {
    view?: string;
    edit?: string;
    delete?: string;
    restore?: string;
  };
};

export function ActionsColumn<T>(handlers: RowActionHandlers<T>): ColumnDef<T, unknown> {
  const {
    onView,
    onEdit,
    onDelete,
    onRestore,
    canView = true,
    canEdit = true,
    canDelete = true,
    showRestore = () => false,
    showDelete = () => true,
    labels = {},
  } = handlers;

  return {
    id: 'actions',
    header: () => (
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        Actions
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 116,
    cell: ({ row }) => {
      const r = row.original;
      const restore = showRestore(r);
      const del = showDelete(r);

      return (
        <div className="actions-col" onClick={(e) => e.stopPropagation()} role="presentation">
          {canView && onView && (
            <IconButton
              aria-label={labels.view ?? 'View'}
              style={{ width: 26, height: 26 }}
              onClick={() => onView(r)}
            >
              <Eye size={13} />
            </IconButton>
          )}
          {canEdit && onEdit && (
            <IconButton
              aria-label={labels.edit ?? 'Edit'}
              style={{ width: 26, height: 26 }}
              onClick={() => onEdit(r)}
            >
              <Pencil size={13} />
            </IconButton>
          )}
          {canDelete && restore && onRestore && (
            <IconButton
              aria-label={labels.restore ?? 'Restore'}
              style={{ width: 26, height: 26 }}
              onClick={() => onRestore(r)}
            >
              <Check size={13} />
            </IconButton>
          )}
          {canDelete && del && onDelete && (
            <IconButton
              aria-label={labels.delete ?? 'Delete'}
              style={{ width: 26, height: 26 }}
              onClick={() => onDelete(r)}
            >
              <X size={13} />
            </IconButton>
          )}
        </div>
      );
    },
    meta: { align: 'center' },
  };
}
