import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Download, Pencil, XCircle } from 'lucide-react';
import { Button, DynamicForm, FormMode, PageHead, type CustomFunctions } from '@epay/ui';
import { printReceipt } from '@/features/receipt/print-receipt';
import { DeclarationModal } from './components/declaration-modal';
import { ConfirmationSecurityField } from './components/confirmation-security-field';
import { buildConfirmationFormConfig } from './confirmation-form-config';
import { detailToFormValues } from './domain/detail-to-form-values';
import { useConfirmation } from './hooks/use-confirmation';
import type { DeclarationInput, SecurityChecks } from './domain/types';

const EMPTY_CHECKS: SecurityChecks = {
  identityChecked: false,
  photoMatched: false,
  authorityChecked: false,
  noSuspicion: false,
};

export function ConfirmationPage({ requestApprove = false }: { requestApprove?: boolean }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { txId, view, loading, mode, approve, cancel } = useConfirmation(requestApprove);

  const [otp, setOtp] = useState('');
  const [checks, setChecks] = useState<SecurityChecks>(EMPTY_CHECKS);
  const [declOpen, setDeclOpen] = useState(false);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildConfirmationFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const isApprove = mode === 'Approve';

  const initialValues = useMemo(() => {
    if (!view) return {};
    const agentRoleLabel =
      view.agentRole === 'Sender' ? t('wa_col_sender_agent') : t('wa_col_receiver_agent');
    return detailToFormValues(view.detail, i18n.language, translate, checks, otp, agentRoleLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, checks, otp, i18n.language]);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        ConfirmationSecurity: (props) => (
          <ConfirmationSecurityField
            {...props}
            componentProps={{
              editable: isApprove,
              requiresAuthority: view?.requiresAuthority ?? false,
            }}
          />
        ),
      },
      onFieldChange: (name, value) => {
        if (name !== 'security') return;
        const s = value as { otp: string; checks: SecurityChecks };
        setOtp(s.otp);
        setChecks(s.checks);
      },
    }),
    [isApprove, view?.requiresAuthority],
  );

  const runApprove = (declaration?: DeclarationInput) => {
    const result = approve({ otp, checks, declaration });
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return false;
    }
    toast.success(t('ag_cf_approved'));
    navigate(`/transactions/${txId}/signed-receipt`);
    return true;
  };

  const handleApprove = () => {
    if (view?.isCritical) {
      setDeclOpen(true);
      return;
    }
    runApprove();
  };

  const handleCancel = () => {
    const result = cancel();
    if (!result.ok) {
      toast.error(t(result.error ?? 'ap_save_failed'));
      return;
    }
    toast.success(t('ag_cf_cancelled'));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('frp_tx_not_found')}</h3>
        <Button type="button" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
          {t('td_back')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={isApprove ? t('ag_cf_title_approve') : t('ag_cf_title_detail')}
        subtitle={<span className="mono">{view.detail.transactionNo}</span>}
        actions={
          isApprove ? (
            <>
              <Button type="button" variant="primary" onClick={handleApprove}>
                <CheckCircle size={14} /> {t('ag_cf_approve')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                <Pencil size={14} /> {t('ag_cf_edit')}
              </Button>
              <Button type="button" variant="danger" onClick={handleCancel}>
                <XCircle size={14} /> {t('ag_cf_cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={14} /> {t('td_back')}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!view.hasReceipt}
                title={view.hasReceipt ? undefined : t('ag_cf_receipt_disabled')}
                onClick={() => printReceipt(txId)}
              >
                <Download size={14} /> {t('ag_cf_download_receipt')}
              </Button>
            </>
          )
        }
      />

      <DynamicForm
        config={formConfig}
        mode={isApprove ? FormMode.Update : FormMode.View}
        permissions={{ view: true, update: isApprove }}
        initialValues={initialValues}
        customFunctions={customFunctions}
        t={translate}
      />

      {declOpen ? (
        <DeclarationModal
          open={declOpen}
          onClose={() => setDeclOpen(false)}
          onConfirm={(declaration) => {
            setDeclOpen(false);
            runApprove(declaration);
          }}
        />
      ) : null}
    </>
  );
}
