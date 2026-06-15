import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import type { ActionButtonId } from '../domain/form-permissions';

type Props = {
  buttons: ActionButtonId[];
  onAction: (id: ActionButtonId) => void;
  saveDisabled?: boolean;
};

export function CaseActionBar({ buttons, onAction, saveDisabled }: Props) {
  const { t } = useTranslation();
  const label: Record<ActionButtonId, string> = {
    attach: t('scf_btn_attach'),
    save: t('ib_save'),
    take: t('scf_btn_take'),
    transfer: t('scf_btn_transfer'),
    contact: t('scf_btn_contact'),
    infoRequest: t('scf_btn_info'),
    resolve: t('scf_btn_resolve'),
    reject: t('scf_btn_reject'),
    reopen: t('scf_btn_reopen'),
  };

  const primaryIds = new Set<ActionButtonId>(['save', 'resolve']);
  const ordered = [
    ...buttons.filter((id) => !primaryIds.has(id)),
    ...buttons.filter((id) => primaryIds.has(id)),
  ];

  return (
    <>
      {ordered.map((id) => (
        <Button
          key={id}
          type="button"
          variant={primaryIds.has(id) ? 'primary' : 'ghost'}
          disabled={id === 'save' && saveDisabled}
          onClick={() => onAction(id)}
        >
          {label[id]}
        </Button>
      ))}
    </>
  );
}
