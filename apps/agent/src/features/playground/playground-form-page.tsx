import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Beaker, Table2 } from 'lucide-react';
import {
  DynamicForm,
  FormMode,
  isFormCreate,
  isFormDelete,
  isFormReadOnly,
  isFormUpdate,
  isFormView,
  type CustomFunctions,
} from '@epay/ui';
import {
  createCustomer,
  customerToFormValues,
  deleteCustomer,
  ensurePlaygroundCustomersSeeded,
  getCustomerById,
  updateCustomer,
} from '@epay/data';
import { buildPlaygroundFormConfig, playgroundFormApiCall } from './playground-form-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

function formStatusClass(mode: FormMode): string {
  if (isFormDelete(mode)) return 'danger';
  if (isFormCreate(mode) || isFormView(mode)) return 'inactive';
  if (isFormUpdate(mode)) return 'active';
  return 'muted';
}

function formStatusKey(mode: FormMode): string {
  if (isFormCreate(mode)) return 'pg_status_create';
  if (isFormView(mode)) return 'pg_status_view';
  if (isFormUpdate(mode)) return 'pg_status_edit';
  if (isFormDelete(mode)) return 'pg_status_delete';
  return 'pg_status_view';
}

function formTitleKey(mode: FormMode): string {
  if (isFormCreate(mode)) return 'pg_form_new';
  if (isFormUpdate(mode)) return 'pg_form_edit';
  if (isFormDelete(mode)) return 'pg_form_delete';
  return 'pg_form_view';
}

export function PlaygroundFormPage({ mode }: { mode: FormMode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const [loading, setLoading] = useState(!isFormCreate(mode));
  const [editRow, setEditRow] = useState<Record<string, unknown> | undefined>();
  const ui = useAgentUiPermissions();

  const formConfig = useMemo(
    () => buildPlaygroundFormConfig(translate),
    [i18n.language],
  );
  const customFunctions: CustomFunctions = { apiCall: playgroundFormApiCall };

  useEffect(() => {
    void ensurePlaygroundCustomersSeeded();
  }, []);

  useEffect(() => {
    if (isFormCreate(mode) || !id) {
      setEditRow(undefined);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getCustomerById(id).then((row) => {
      if (cancelled) return;
      if (!row) {
        toast.error(t('pg_customer_not_found'));
        navigate('/playground', { replace: true });
        return;
      }
      setEditRow(customerToFormValues(row));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, id, navigate, t]);

  const formInitialValues = useMemo(
    () => (editRow ? { ...editRow } : undefined),
    [editRow],
  );

  const title = t(formTitleKey(mode));

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (isFormCreate(mode)) {
        const created = await createCustomer(values);
        toast.success(t('pg_created', { id: created.id }));
      } else if (isFormUpdate(mode) && id) {
        const updated = await updateCustomer(id, values);
        if (!updated) {
          toast.error(t('pg_update_failed'));
          return;
        }
        toast.success(t('pg_updated'));
      }
      navigate('/playground');
    } catch (err) {
      console.error(err);
      toast.error(t('pg_save_error'));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = await deleteCustomer(id);
    if (ok) {
      toast.success(t('pg_deleted', { name: String(editRow?.name ?? '') }));
      navigate('/playground');
    } else {
      toast.error(t('pg_not_found'));
    }
  };

  const goBack = () => navigate('/playground');

  if (!isFormCreate(mode) && id && loading) {
    return (
      <p className="t-mute fs-12" style={{ padding: 24 }}>
        {t('pg_record_loading')}
      </p>
    );
  }

  if (!isFormCreate(mode) && id && !loading && !editRow) {
    return null;
  }

  return (
    <DynamicForm
      config={formConfig}
      mode={mode}
      permissions={ui.form.playground}
      initialValues={formInitialValues}
      customFunctions={customFunctions}
      loading={loading}
      t={translate}
      shell={{
        title: (
          <>
            <Beaker size={16} style={{ marginRight: 6 }} />
            {t('pg_title')}
          </>
        ),
        subtitle: t('pg_subtitle_form'),
        status: <span className="badge muted">DEV</span>,
        actions: (
          <button type="button" className="btn btn-ghost" onClick={goBack}>
            <Table2 size={14} /> {t('pg_back_table')}
          </button>
        ),
      }}
      header={{
        title: id ? (
          <>
            {title}
            <span className="t-mute fs-12" style={{ marginLeft: 8, fontWeight: 400 }}>
              #{id}
            </span>
          </>
        ) : (
          title
        ),
        subtitle: isFormDelete(mode) ? t('pg_form_delete_subtitle') : t('pg_form_subtitle'),
        status: (
          <span className={`badge ${formStatusClass(mode)}`}>{t(formStatusKey(mode))}</span>
        ),
      }}
      onSubmit={isFormReadOnly(mode) ? undefined : handleSubmit}
      onCancel={goBack}
      onDelete={id && !isFormCreate(mode) ? handleDelete : undefined}
    />
  );
}
