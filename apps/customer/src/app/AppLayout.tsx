import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { TransferDraftTabBanner } from '@/components/TransferDraftTabBanner';

export function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === '/confirm';

  return (
    <div className="app">
      {!hideHeader && <Header />}
      <DemoModeBanner placement="page-top" />
      <TransferDraftTabBanner />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
