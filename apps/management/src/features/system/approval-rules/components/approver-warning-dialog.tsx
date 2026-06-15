import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import type { ApproverAvailabilityIssue } from '../domain/types';

type Props = {
  open: boolean;
  issues: ApproverAvailabilityIssue[];
  blocking?: boolean;
  onClose: () => void;
};

export function ApproverWarningDialog({ open, issues, blocking = true, onClose }: Props) {
  const { t } = useTranslation();
  if (!open || issues.length === 0) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
    >
      <div className="card" style={{ padding: 24, maxWidth: 480, width: '90%' }}>
        <h3 className="fs-14" style={{ margin: '0 0 12px' }}>
          {blocking ? t('ar_dialog_block_title') : t('ar_dialog_warn_title')}
        </h3>
        <ul className="fs-12" style={{ margin: '0 0 16px', paddingLeft: 20 }}>
          {issues.map((issue) => (
            <li key={issue.screenKey} style={{ marginBottom: 8 }}>
              {t('ar_dialog_issue', {
                screen: t(issue.screenLabelKey, issue.screenKey),
                count: issue.approvalCount,
              })}
            </li>
          ))}
        </ul>
        <Button type="button" variant="primary" size="sm" onClick={onClose}>
          {t('ar_dialog_close')}
        </Button>
      </div>
    </div>
  );
}
