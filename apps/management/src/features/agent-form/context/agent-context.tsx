import { createContext, useContext } from 'react';
import type { AgentApi } from '../hooks/use-agent';

const AgentContext = createContext<AgentApi | null>(null);

export function AgentProvider({
  value,
  children,
}: {
  value: AgentApi;
  children: React.ReactNode;
}) {
  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgentForm() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgentForm must be used within AgentProvider');
  return ctx;
}
