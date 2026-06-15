import { ReceiptDocument } from '../receipt-document';
import type { ReceiptModel } from '../build-receipt-model';

type Props = {
  value?: unknown;
  componentProps?: { model?: ReceiptModel | null };
};

/** DynamicForm CustomComponent — dekont gövdesi. */
export function ReceiptDocumentField({ componentProps }: Props) {
  const model = componentProps?.model;
  if (!model) return null;
  return <ReceiptDocument model={model} />;
}
