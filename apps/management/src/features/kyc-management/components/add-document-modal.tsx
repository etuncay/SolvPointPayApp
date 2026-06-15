import { DocUploadModal } from '@/features/individual-form/components/doc-upload-modal';
import type { KycDocumentInput } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: KycDocumentInput) => void;
};

export function AddDocumentModal({ open, onClose, onConfirm }: Props) {
  return (
    <DocUploadModal
      open={open}
      onClose={onClose}
      onSubmit={(doc) =>
        onConfirm({
          category: doc.category,
          type: doc.type,
          validFrom: doc.validFrom,
          validTo: doc.validTo,
        })
      }
    />
  );
}
