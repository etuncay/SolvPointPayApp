import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  TransferConfirmation,
  TransferDraftInput,
  TransferApproveResult,
} from '@epay/data';
import { customerPortalApi } from '@epay/data';
import {
  hasTransferDraftTabConflict,
  isForeignTransferDraftLockHeld,
  releaseTransferDraftLock,
  touchTransferDraftLock,
  TRANSFER_DRAFT_LOCK_STORAGE_KEY,
  writeTransferDraftLock,
} from '@/lib/transfer-draft-tab-lock';

interface TransferDraftContextValue {
  draft: TransferDraftInput | null;
  confirmation: TransferConfirmation | null;
  result: TransferApproveResult | null;
  hydrating: boolean;
  transferTabConflict: boolean;
  setDraft: (d: TransferDraftInput | null) => void;
  submitForReview: (d: TransferDraftInput) => Promise<boolean>;
  approve: (otp: string, declaration?: string) => Promise<string | null>;
  cancel: () => Promise<void>;
  clear: () => void;
  releaseLocalDraft: () => void;
}

const TransferDraftContext = createContext<TransferDraftContextValue | null>(null);

function syncConflict(confirmation: TransferConfirmation | null): boolean {
  return hasTransferDraftTabConflict(confirmation?.transactionId ?? null);
}

export function TransferDraftProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<TransferDraftInput | null>(null);
  const [confirmation, setConfirmation] = useState<TransferConfirmation | null>(null);
  const [result, setResult] = useState<TransferApproveResult | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [transferTabConflict, setTransferTabConflict] = useState(false);

  const refreshConflict = useCallback((pending: TransferConfirmation | null) => {
    setTransferTabConflict(syncConflict(pending));
  }, []);

  useEffect(() => {
    void customerPortalApi
      .getPendingTransfer()
      .then((pending) => {
        if (!pending) {
          refreshConflict(null);
          return;
        }
        setConfirmation(pending);
        setDraft(pending.draft);
        writeTransferDraftLock(pending.transactionId);
        refreshConflict(pending);
      })
      .finally(() => setHydrating(false));
  }, [refreshConflict]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== TRANSFER_DRAFT_LOCK_STORAGE_KEY) return;
      setTransferTabConflict(syncConflict(confirmation));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [confirmation]);

  useEffect(() => {
    if (!confirmation || transferTabConflict) return;
    touchTransferDraftLock(confirmation.transactionId);
    const id = window.setInterval(() => {
      touchTransferDraftLock(confirmation.transactionId);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [confirmation, transferTabConflict]);

  useEffect(() => {
    const onUnload = () => releaseTransferDraftLock();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const submitForReview = useCallback(
    async (d: TransferDraftInput) => {
      if (isForeignTransferDraftLockHeld()) {
        setTransferTabConflict(true);
        return false;
      }
      setDraft(d);
      const conf = await customerPortalApi.createTransferDraft(d);
      writeTransferDraftLock(conf.transactionId);
      setConfirmation(conf);
      setTransferTabConflict(false);
      return true;
    },
    [],
  );

  const approve = useCallback(
    async (otp: string, declaration?: string) => {
      if (!confirmation) return 'Onay bekleyen işlem yok.';
      if (syncConflict(confirmation)) {
        setTransferTabConflict(true);
        return 'transfer_draft_tab_approve_blocked';
      }
      try {
        const res = await customerPortalApi.approveTransfer(
          confirmation.transactionId,
          otp,
          `idem-${confirmation.transactionId}`,
          declaration,
        );
        setResult(res);
        releaseTransferDraftLock();
        if (draft?.saveRecipient) {
          void qc.invalidateQueries({ queryKey: ['recipients'] });
        }
        return null;
      } catch {
        return 'Onay başarısız. Kod: ERR-OTP';
      }
    },
    [confirmation, draft?.saveRecipient, qc],
  );

  const cancel = useCallback(async () => {
    if (confirmation) {
      await customerPortalApi.cancelTransfer(confirmation.transactionId);
      releaseTransferDraftLock();
    }
    setDraft(null);
    setConfirmation(null);
    setResult(null);
    setTransferTabConflict(syncConflict(null));
  }, [confirmation]);

  const clear = useCallback(() => {
    void customerPortalApi.clearPendingTransfer();
    releaseTransferDraftLock();
    setDraft(null);
    setConfirmation(null);
    setResult(null);
    setTransferTabConflict(false);
  }, []);

  const releaseLocalDraft = useCallback(() => {
    void customerPortalApi.clearPendingTransfer();
    setDraft(null);
    setConfirmation(null);
    setResult(null);
    setTransferTabConflict(syncConflict(null));
  }, []);

  const value = useMemo(
    () => ({
      draft,
      confirmation,
      result,
      hydrating,
      transferTabConflict,
      setDraft,
      submitForReview,
      approve,
      cancel,
      clear,
      releaseLocalDraft,
    }),
    [
      draft,
      confirmation,
      result,
      hydrating,
      transferTabConflict,
      submitForReview,
      approve,
      cancel,
      clear,
      releaseLocalDraft,
    ],
  );

  return (
    <TransferDraftContext.Provider value={value}>{children}</TransferDraftContext.Provider>
  );
}

export function useTransferDraft(): TransferDraftContextValue {
  const ctx = useContext(TransferDraftContext);
  if (!ctx) throw new Error('useTransferDraft provider gerekli');
  return ctx;
}
