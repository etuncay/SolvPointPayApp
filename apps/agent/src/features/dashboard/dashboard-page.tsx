import { useTranslation } from 'react-i18next';
import { PageHead } from '@epay/ui';
import { FailedAccessBanner } from './panels/failed-access-banner';
import { DailyCharts } from './panels/daily-charts';
import { PendingTransactionsPanel } from './panels/pending-transactions-panel';
import { PendingCustomersPanel } from './panels/pending-customers-panel';
import './dashboard.css';

/** Agent Ana Sayfa (1) — günlük grafikler + bekleyen işlem/müşteri panelleri. */
export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHead title={t('page_title')} subtitle={t('ag_home_subtitle')} />
      <FailedAccessBanner />
      <DailyCharts />
      <PendingTransactionsPanel />
      <PendingCustomersPanel />
    </>
  );
}
