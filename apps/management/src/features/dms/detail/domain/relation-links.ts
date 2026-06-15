import { TRANSACTIONS } from '@/mocks/transactions';
import type { DocumentRelation, DocumentRelationType } from '@/features/dms/domain/types';

/** Demo müşteri no → route */
const CUSTOMER_ROUTES: Record<
  string,
  { customerId: number; subType: 'individual' | 'corporate' }
> = {
  '10042': { customerId: 99901, subType: 'individual' },
  '10055': { customerId: 99904, subType: 'individual' },
  '099903': { customerId: 99903, subType: 'corporate' },
};

const AGENT_ROUTES: Record<string, string> = {
  'AG-1001': '099901',
};

export function buildRelationHref(
  relationType: DocumentRelationType,
  relatedId: string,
): string | null {
  const id = relatedId.trim();
  if (!id) return null;

  switch (relationType) {
    case 'Customer': {
      const mapped = CUSTOMER_ROUTES[id];
      if (mapped) {
        return `/customers/${mapped.customerId}/${mapped.subType}`;
      }
      const numeric = Number(id);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return `/customers/${numeric}/individual`;
      }
      return null;
    }
    case 'Agent': {
      const agentId = AGENT_ROUTES[id] ?? id.replace(/^AG-/, '');
      return `/agents/${agentId}`;
    }
    case 'Transaction': {
      const tx = TRANSACTIONS.find(
        (t) => t.recordStatus === 1 && (t.txNo === id || t.referenceNo === id),
      );
      if (tx) return `/transfers/${tx.id}`;
      return `/transfers?ref=${encodeURIComponent(id)}`;
    }
    case 'Complaint':
      return `/support/cases/${encodeURIComponent(id)}`;
    case 'Employee':
      return `/hr/employees/${encodeURIComponent(id)}`;
    default:
      return null;
  }
}

export function mapRelationsToViews(relations: DocumentRelation[]): {
  relationType: DocumentRelationType;
  relatedId: string;
  href: string | null;
}[] {
  return relations.map((r) => ({
    relationType: r.relationType,
    relatedId: r.relatedId,
    href: buildRelationHref(r.relationType, r.relatedId),
  }));
}
