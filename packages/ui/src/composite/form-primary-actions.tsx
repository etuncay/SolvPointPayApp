import * as React from 'react';
import { Button } from '../primitives/button';

export type FormPrimaryActionsProps = {
  onSave?: () => void;
  onCancel?: () => void;
  onDraft?: () => void;
  saveLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  draftLabel?: React.ReactNode;
  showSave?: boolean;
  showCancel?: boolean;
  showDraft?: boolean;
  saveDisabled?: boolean;
  /** Kaydet/Vazgeç öncesi ikincil aksiyonlar */
  leading?: React.ReactNode;
  /** Vazgeç sonrası ikincil aksiyonlar (bloke, belge vb.) */
  trailing?: React.ReactNode;
};

/** Standart form üst barı: Taslak → Kaydet → Vazgeç sırası (agents/new referansı). */
export function FormPrimaryActions({
  onSave,
  onCancel,
  onDraft,
  saveLabel = 'Kaydet',
  cancelLabel = 'Vazgeç',
  draftLabel = 'Taslak Kaydet',
  showSave = true,
  showCancel = true,
  showDraft = false,
  saveDisabled,
  leading,
  trailing,
}: FormPrimaryActionsProps) {
  return (
    <>
      {leading}
      {showDraft && onDraft ? (
        <Button type="button" variant="ghost" onClick={onDraft}>
          {draftLabel}
        </Button>
      ) : null}
      {showSave && onSave ? (
        <Button type="button" variant="primary" onClick={onSave} disabled={saveDisabled}>
          {saveLabel}
        </Button>
      ) : null}
      {showCancel && onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
      ) : null}
      {trailing}
    </>
  );
}
