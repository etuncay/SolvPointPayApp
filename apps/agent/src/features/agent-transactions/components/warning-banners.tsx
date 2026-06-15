import { SearchWarningsBanner } from '@/features/customer-search/components/search-warnings-banner';
import type { CustomerSearchWarning } from '@/features/customer-search/domain/types';

interface Props {
  warnings: CustomerSearchWarning[];
}

/** Ortak işlem uyarı bandı (6.para-transferi.md §5). */
export function TransactionWarningBanners({ warnings }: Props) {
  return <SearchWarningsBanner warnings={warnings} />;
}
