import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import {
  Check,
  FileWarning,
  GitBranch,
  ShieldOff,
  UserPlus,
  X,
} from 'lucide-react';
import type { CompliancePersona } from '../domain/compliance-persona';
import { setCompliancePersona } from '../domain/compliance-persona';
import type { CaseDetailPermissions } from '../domain/detail-permissions';

type Props = {
  permissions: CaseDetailPermissions;
  persona: CompliancePersona;
  onPersonaChange: (p: CompliancePersona) => void;
  onApprove: () => void;
  onReject: () => void;
  onRoute: () => void;
  onException: () => void;
  onReport: () => void;
};

export function CaseActionBar({
  permissions,
  persona,
  onPersonaChange,
  onApprove,
  onReject,
  onRoute,
  onException,
  onReport,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="case-action-bar"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: 16,
      }}
    >
      <select
        className="input"
        style={{ width: 140, marginRight: 8 }}
        value={persona}
        onChange={(e) => {
          const p = e.target.value as CompliancePersona;
          setCompliancePersona(p);
          onPersonaChange(p);
        }}
        title={t('fcd_persona_hint')}
      >
        <option value="operator">{t('fcd_persona_operator')}</option>
        <option value="manager">{t('fcd_persona_manager')}</option>
      </select>

      {!permissions.actionsEnabled ? (
        <span className="t-mute fs-13">{t('fcd_actions_closed')}</span>
      ) : (
        <>
          {permissions.canApprove && (
            <Button type="button" variant="primary" size="sm" onClick={onApprove}>
              <Check size={14} /> {t('fcd_action_approve')}
            </Button>
          )}
          {permissions.canReject && (
            <Button type="button" variant="danger" size="sm" onClick={onReject}>
              <X size={14} /> {t('scf_btn_reject')}
            </Button>
          )}
          {permissions.canRoute && (
            <Button type="button" variant="ghost" size="sm" onClick={onRoute}>
              <UserPlus size={14} /> {t('fcd_action_route')}
            </Button>
          )}
          {permissions.canException && (
            <Button type="button" variant="ghost" size="sm" onClick={onException}>
              <ShieldOff size={14} /> {t('fcd_action_exception')}
            </Button>
          )}
          {permissions.canReport && (
            <Button type="button" variant="ghost" size="sm" onClick={onReport}>
              <FileWarning size={14} /> {t('fcd_action_report')}
            </Button>
          )}
        </>
      )}
      <GitBranch size={14} className="t-mute" style={{ marginLeft: 'auto' }} />
    </div>
  );
}
