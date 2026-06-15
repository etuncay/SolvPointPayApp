import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  TransferConfirmation,
  TransferDraftInput,
  TransferApproveResult,
} from '@epay/data';
import { customerPortalApi } from '@epay/data';

interface TransferDraftContextValue {
  draft: TransferDraftInput | null;
  confirmation: TransferConfirmation | null;
  result: TransferApproveResult | null;
  setDraft: (d: TransferDraftInput | null) => void;
  submitForReview: (d: TransferDraftInput) => Promise<void>;
  approve: (otp: string, declaration?: string) => Promise<string | null>;
  cancel: () => Promise<void>;
  clear: () => void;
}

const TransferDraftContext = createContext<TransferDraftContextValue | null>(null);

export function TransferDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<TransferDraftInput | null>(null);
  const [confirmation, setConfirmation] = useState<TransferConfirmation | null>(null);
  const [result, setResult] = useState<TransferApproveResult | null>(null);

  const submitForReview = useCallback(async (d: TransferDraftInput) => {
    setDraft(d);
    const conf = await customerPortalApi.createTransferDraft(d);
    setConfirmation(conf);
  }, []);

  const approve = useCallback(
    async (otp: string, declaration?: string) => {
      if (!confirmation) return 'Onay bekleyen işlem yok.';
      try {
        const res = await customerPortalApi.approveTransfer(
          confirmation.transactionId,
          otp,
          `idem-${confirmation.transactionId}`,
          declaration,
        );
        setResult(res);
        return null;
      } catch {
        return 'Onay başarısız. Kod: ERR-OTP';
      }
    },
    [confirmation],
  );

  const cancel = useCallback(async () => {
    if (confirmation) {
      await customerPortalApi.cancelTransfer(confirmation.transactionId);
    }
    setDraft(null);
    setConfirmation(null);
    setResult(null);
  }, [confirmation]);

  const clear = useCallback(() => {
    setDraft(null);
    setConfirmation(null);
    setResult(null);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      confirmation,
      result,
      setDraft,
      submitForReview,
      approve,
      cancel,
      clear,
    }),
    [draft, confirmation, result, submitForReview, approve, cancel, clear],
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
