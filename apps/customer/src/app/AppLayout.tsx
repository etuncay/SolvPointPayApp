import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

export function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === '/confirm';

  return (
    <div className="app">
      {!hideHeader && <Header />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
