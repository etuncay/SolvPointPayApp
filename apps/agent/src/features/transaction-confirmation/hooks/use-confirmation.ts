import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { agentTransactionsService } from '../api/agent-transactions-service';
import { resolveConfirmationMode } from '../domain/confirmation-mode';
import type { ApproveInput, ConfirmationView } from '../domain/types';

export function useConfirmation(requestApprove: boolean) {
  const { id } = useParams<{ id: string }>();
  const txId = Number(id);
  const [view, setView] = useState<ConfirmationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLoading(true);
    const result = Number.isFinite(txId) ? agentTransactionsService.getConfirmation(txId) : null;
    setView(result);
    setLoading(false);
  }, [txId, version]);

  const mode = useMemo(
    () => (view ? resolveConfirmationMode(view.detail.status, requestApprove) : 'Detail'),
    [view, requestApprove],
  );

  const approve = (input: ApproveInput) => agentTransactionsService.approve(txId, input);
  const cancel = () => agentTransactionsService.cancel(txId);
  const reload = () => setVersion((v) => v + 1);

  return { txId, view, loading, mode, approve, cancel, reload };
}
