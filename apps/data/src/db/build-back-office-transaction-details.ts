import type {
  BackOfficeTransactionBlock,
  BackOfficeTransactionDetailSeed,
  BackOfficeTransactionDocument,
  BackOfficeTransactionNote,
  BuildBackOfficeTransactionDetailsInput,
} from '../types/transaction-detail';

/** İşlem detay mock seed — not, belge, bloke kayıtları */
export function buildBackOfficeTransactionDetails(
  input: BuildBackOfficeTransactionDetailsInput,
): BackOfficeTransactionDetailSeed {
  const active = input.transactions.filter((t) => t.recordStatus === 1);

  const notes: BackOfficeTransactionNote[] = [];
  let noteId = 1;
  for (const tx of active.slice(0, 20)) {
    notes.push({
      id: noteId++,
      transactionId: tx.id,
      action: 'Kayıt',
      text: 'İşlem sisteme alındı.',
      createdBy: 'system',
      createdAt: tx.createdAt,
    });
    if (tx.status === 'OnHold') {
      const holdAt = `${tx.createdAt.slice(0, 10)} 14:30:00`;
      notes.push({
        id: noteId++,
        transactionId: tx.id,
        action: 'Bloke Et',
        text: 'AML inceleme — manuel bloke.',
        createdBy: 'compliance.user',
        createdAt: holdAt,
      });
    }
  }

  const documents: BackOfficeTransactionDocument[] = [];
  let docId = 1;
  for (const tx of active.slice(0, 15)) {
    documents.push({
      id: docId++,
      transactionId: tx.id,
      docType: 'Identity',
      fileName: `kimlik-${tx.txNo}.pdf`,
      uploadedAt: tx.createdAt,
    });
    if (tx.type === 'WalletToBankAccount' || tx.type === 'InternationalTransfer') {
      documents.push({
        id: docId++,
        transactionId: tx.id,
        docType: 'ProofOfTransaction',
        fileName: `dekont-${tx.txNo}.pdf`,
        uploadedAt: tx.createdAt,
      });
    }
  }

  const blocks: BackOfficeTransactionBlock[] = [];
  let blockId = 1;
  for (const tx of active.filter((t) => t.status === 'OnHold')) {
    const feeFixed = tx.feeFixed ?? Math.round(tx.amount * 0.01);
    const feeVariable = tx.feeVariable ?? Math.round(tx.amount * 0.005);
    blocks.push({
      id: blockId++,
      transactionId: tx.id,
      blockedAmount: tx.amount + feeFixed + feeVariable,
      active: true,
      reason: 'AML inceleme',
      createdAt: tx.createdAt,
      releasedAt: null,
    });
  }

  return { notes, documents, blocks };
}
