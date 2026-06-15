import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme="system"
      toastOptions={{
        style: {
          background: 'var(--bg-elev)',
          color: 'var(--fg)',
          border: '1px solid var(--line)',
        },
      }}
    />
  );
}
