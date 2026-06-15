import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { DynamicTable, type TranslateFn } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import type { CustomerNote, CustomerNoteInput, PriorityLevel, TargetEntityType } from './domain/types';
import { useCustomerNotes } from './hooks/use-customer-notes';
import { buildCustomerNotesTableConfig } from './customer-notes-table-config';
import { CustomerNoteFormModal } from './components/customer-note-form-modal';
import { getCustomerNotePermissions } from './domain/permissions';

function priorityClass(level: PriorityLevel) {
  switch (level) {
    case 'Critical':
      return 'critical';
    case 'High':
      return 'high';
    case 'Medium':
      return 'med';
    default:
      return 'low';
  }
}

export function CustomerNotesPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const permissions = getCustomerNotePermissions(role);
  const { create, update, remove } = useCustomerNotes();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedNote, setSelectedNote] = useState<CustomerNote | null>(null);
  const [tableVersion, setTableVersion] = useState(0);

  const translate: TranslateFn = (key, fb) => t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () => buildCustomerNotesTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, tableVersion],
  );

  const targetLabel = useMemo(
    () =>
      ({
        IndividualCustomer: t('cn_target_IndividualCustomer'),
        CorporateCustomer: t('cn_target_CorporateCustomer'),
        Agent: t('cn_target_Agent'),
      }) satisfies Record<TargetEntityType, string>,
    [t],
  );

  const priorityLabel = useMemo(
    () =>
      ({
        Low: t('rs_level_low'),
        Medium: t('rs_level_medium'),
        High: t('scf_level_High'),
        Critical: t('scf_level_Critical'),
      }) satisfies Record<PriorityLevel, string>,
    [t],
  );

  if (!permissions.list) {
    return <Navigate to="/" replace />;
  }

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNote(null);
  };

  const openCreate = () => {
    if (!permissions.insert) return;
    setModalMode('create');
    setSelectedNote(null);
    setModalOpen(true);
  };

  const openEdit = (note: CustomerNote) => {
    if (!permissions.update) return;
    setModalMode('edit');
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleSaveCreate = (input: CustomerNoteInput) => {
    const result = create(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('cn_created'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleSaveUpdate = (id: number, input: CustomerNoteInput) => {
    const result = update(id, input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('cn_updated'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleDelete = (note: CustomerNote) => {
    if (!permissions.delete) return;
    if (!window.confirm(t('cn_delete_confirm'))) return;

    const result = remove(note.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return;
    }
    toast.success(t('cn_deleted'));
    setTableVersion((v) => v + 1);
    if (selectedNote?.id === note.id) closeModal();
  };

  const customFunctions = {
    renderTarget: (_v: unknown, row: Record<string, unknown>) => {
      const n = row as CustomerNote;
      return <span className="fs-12">{targetLabel[n.targetEntityType]}</span>;
    },
    renderPriority: (_v: unknown, row: Record<string, unknown>) => {
      const n = row as CustomerNote;
      return (
        <span className={`risk-seg ${priorityClass(n.priorityLevel)}`}>{priorityLabel[n.priorityLevel]}</span>
      );
    },
    renderDisplayLimit: (v: unknown, _row: Record<string, unknown>) => (
      <span className="mono fs-12">{v == null ? '—' : String(v)}</span>
    ),
    renderDisplayCount: (v: unknown, _row: Record<string, unknown>) => (
      <span className="mono fs-12 t-mute" title={t('cn_display_count_hint')}>
        {v == null ? '—' : String(v)}
      </span>
    ),
    renderEndDate: (v: unknown, _row: Record<string, unknown>) => (
      <span className="mono fs-12">{v ? String(v) : '—'}</span>
    ),
    renderActions: (_v: unknown, row: Record<string, unknown>) => {
      const n = row as CustomerNote;
      return (
        <div className="row-actions">
          {permissions.update && (
            <button type="button" title={t('cn_act_edit')} onClick={() => openEdit(n)}>
              <Pencil size={14} />
            </button>
          )}
          {permissions.delete && (
            <button type="button" title={t('cn_act_delete')} onClick={() => handleDelete(n)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      );
    },
  };

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{ title: t('s_cust_notes'), subtitle: t('cn_subtitle') }}
        permissions={{
          new: permissions.insert,
          edit: false,
          delete: false,
          view: true,
          export: false,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={permissions.insert ? openCreate : undefined}
      />

      <CustomerNoteFormModal
        open={modalOpen}
        mode={modalMode}
        note={modalMode === 'edit' ? selectedNote : null}
        onClose={closeModal}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
      />
    </>
  );
}

