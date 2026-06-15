/* ──────────────────────────────────────────────────────
 *  useConfirm — window.confirm yerine stillenebilir AlertDialog.
 *  Promise tabanlı: `const ok = await confirm({...})`.
 * ────────────────────────────────────────────────────── */
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../primitives/alert-dialog';
import { cn } from '../lib/utils';

export interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Onay butonu danger (kırmızı) stili */
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

export function useConfirm(): { confirm: (opts?: ConfirmOptions) => Promise<boolean>; dialog: React.ReactNode } {
  const [state, setState] = React.useState<ConfirmState>({ open: false });
  const resolver = React.useRef<((v: boolean) => void) | null>(null);
  /** Radix kapanırken onOpenChange ile buton tıklaması yarışmasın diye */
  const pendingResult = React.useRef<boolean | null>(null);

  const confirm = React.useCallback(
    (opts: ConfirmOptions = {}) =>
      new Promise<boolean>((resolve) => {
        pendingResult.current = null;
        resolver.current = resolve;
        setState({ ...opts, open: true });
      }),
    [],
  );

  const finish = React.useCallback((result: boolean) => {
    const r = resolver.current;
    resolver.current = null;
    pendingResult.current = null;
    r?.(result);
  }, []);

  const close = React.useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const dialog = (
    <AlertDialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) {
          finish(pendingResult.current ?? false);
          close();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {state.title ? <AlertDialogTitle>{state.title}</AlertDialogTitle> : null}
          {state.description ? <AlertDialogDescription>{state.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { pendingResult.current = false; }}>
            {state.cancelLabel ?? 'Vazgeç'}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(state.danger && 'btn-danger')}
            onClick={() => { pendingResult.current = true; }}
          >
            {state.confirmLabel ?? 'Onayla'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, dialog };
}
