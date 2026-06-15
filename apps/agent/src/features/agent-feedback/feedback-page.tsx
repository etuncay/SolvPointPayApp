import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Bell, FileText, Info, LifeBuoy, Plus } from 'lucide-react';
import { DynamicForm, FormMode, PageHead, type CustomFunctions } from '@epay/ui';
import { buildFeedbackFormConfig } from './feedback-form-config';
import { FeedbackAttachments } from './components/feedback-attachments';
import { FeedbackCustomerLookup } from './components/feedback-customer-lookup';
import { FeedbackOwnerSegment } from './components/feedback-owner-segment';
import { useAgentFeedback } from './hooks/use-agent-feedback';

/** Agent Dilek, Şikâyet ve Öneriler — referans dso-page + DynamicForm. */
export function FeedbackPage() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const {
    formKey,
    initialValues,
    submitting,
    successCaseNo,
    attachmentCtx,
    FeedbackAttachmentsProvider,
    resetForm,
    submit,
    openFilePicker,
  } = useAgentFeedback();

  const formConfig = useMemo(
    () => buildFeedbackFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        FeedbackOwnerSegment,
        FeedbackCustomerLookup,
        FeedbackAttachments,
      },
    }),
    [],
  );

  const handleSubmit = async (values: Record<string, unknown>) => {
    const result = await submit(values);
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
  };

  if (successCaseNo) {
    return (
      <>
        <PageHead title={t('ag_nav_feedback')} subtitle={t('ag_fb_subtitle')} />
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="fcard">
            <div className="fcard-body">
              <div className="pt-success">
                <div className="check">✓</div>
                <h2>{t('ag_fb_success_title')}</h2>
                <p className="t-soft">{t('ag_fb_success_desc')}</p>
                <div className="ref">
                  <span className="t-mute">{t('ag_fb_case_no')}:</span>
                  <strong className="mono">{successCaseNo}</strong>
                </div>
                <div className="notify-row" style={{ justifyContent: 'center', marginTop: 14 }}>
                  <span className="notify-pill">
                    <Bell size={12} /> {t('ag_fb_sms_sent')}
                  </span>
                  <span className="notify-pill">
                    <FileText size={12} /> {t('ag_fb_email_sent')}
                  </span>
                </div>
                <div style={{ marginTop: 22, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button type="button" className="btn" onClick={resetForm}>
                    <Plus size={13} /> {t('ag_fb_new')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <FeedbackAttachmentsProvider value={attachmentCtx}>
      <PageHead title={t('ag_nav_feedback')} subtitle={t('ag_fb_subtitle')} />

      <div style={{ maxWidth: 760 }}>
        <div className="pt-banner running" style={{ marginBottom: 14 }}>
          <span className="ic">
            <Info size={15} />
          </span>
          <div>{t('ag_fb_notify')}</div>
        </div>

        <section className="fcard">
          <div className="fcard-head">
            <div className="card-icon accent" style={{ width: 26, height: 26 }}>
              <LifeBuoy size={13} />
            </div>
            <h3>{t('ag_fb_form_title')}</h3>
          </div>
          <div className="fcard-body ag-feedback-embedded">
            <DynamicForm
              key={formKey}
              config={formConfig}
              mode={FormMode.Create}
              permissions={{ create: true }}
              initialValues={initialValues}
              customFunctions={customFunctions}
              loading={submitting}
              t={translate}
              className="ag-feedback-form"
              onButtonClick={(key, values) => {
                if (key === 'clear') {
                  resetForm();
                  return;
                }
                if (key === 'addFile') {
                  openFilePicker();
                  return;
                }
                if (key === 'submit') {
                  void handleSubmit(values);
                }
              }}
              onSubmit={(values) => void handleSubmit(values)}
            />
          </div>
        </section>
      </div>
    </FeedbackAttachmentsProvider>
  );
}
