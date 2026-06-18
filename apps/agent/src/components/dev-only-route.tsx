import { Navigate } from 'react-router-dom';

/** Production build'de geliştirme ekranlarına doğrudan URL ile erişimi engeller. */
export function DevOnlyRoute({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.DEV) return <Navigate to="/" replace />;
  return <>{children}</>;
}
