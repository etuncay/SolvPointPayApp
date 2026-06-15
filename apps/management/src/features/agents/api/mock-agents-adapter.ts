import { AGENTS } from '@/mocks/agents';
import type {
  AgentCounts,
  AgentDashboardStats,
  AgentFilters,
  AgentListItem,
  EntityStatusFilter,
} from '../domain/types';
import { LOW_TRY_BALANCE } from '../domain/types';
import type { AgentsService } from './agents-service';

let store: AgentListItem[] = AGENTS.map((a) => ({ ...a }));

function visibleAgents(): AgentListItem[] {
  return store.filter((a) => a.recordStatus === 1);
}

function buildCounts(agents: AgentListItem[]): AgentCounts {
  const counts: AgentCounts = { active: 0, inactive: 0, blocked: 0, closed: 0, all: agents.length };
  for (const a of agents) counts[a.status] += 1;
  return counts;
}

function buildStats(agents: AgentListItem[]): AgentDashboardStats {
  const active = agents.filter((a) => a.status === 'active').length;
  const totalTRY = agents.reduce((s, a) => s + a.balance.TRY, 0);
  const lowBal = agents.filter(
    (a) => a.balance.TRY < LOW_TRY_BALANCE && a.balance.TRY >= 0 && a.status === 'active',
  ).length;
  const negBal = agents.filter((a) => a.balance.TRY < 0).length;
  const blocked = agents.filter((a) => a.status === 'blocked').length;
  const txToday = agents.reduce((s, a) => s + a.txToday, 0);
  return { active, totalTRY, lowBal, negBal, blocked, txToday, visibleTotal: agents.length };
}

function applyFilters(filters: AgentFilters): AgentListItem[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  const adv = filters.advanced;

  return visibleAgents().filter((a) => {
    if (filters.status !== 'all' && a.status !== filters.status) return false;
    if (adv.group !== 'any' && a.group.key !== adv.group) return false;
    if (adv.settlement !== 'any' && a.settlement !== adv.settlement) return false;
    if (adv.balance === 'neg' && !(a.balance.TRY < 0)) return false;
    if (adv.balance === 'low' && !(a.balance.TRY >= 0 && a.balance.TRY < LOW_TRY_BALANCE)) return false;
    if (adv.balance === 'normal' && !(a.balance.TRY >= LOW_TRY_BALANCE)) return false;
    if (adv.from && a.createdAt < adv.from) return false;
    if (adv.to && a.createdAt > adv.to) return false;
    if (q) {
      const hay = [String(a.id), a.name, a.email, a.phone, a.vkn].join(' ').toLocaleLowerCase('tr-TR');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const mockAgentsAdapter: AgentsService = {
  list(filters) {
    const visible = visibleAgents();
    const rows = applyFilters(filters);
    return {
      rows,
      total: rows.length,
      counts: buildCounts(visible),
      stats: buildStats(visible),
    };
  },

  exportRows(filters) {
    return applyFilters(filters);
  },

  getById(id) {
    return visibleAgents().find((a) => a.id === id) ?? null;
  },
};

export function resetAgentsStore(): void {
  store = AGENTS.map((a) => ({ ...a }));
}

/** Detay kaydı sonrası liste store senkronu */
export function upsertAgentListItem(item: AgentListItem): void {
  const idx = store.findIndex((a) => a.id === item.id);
  if (idx >= 0) store[idx] = { ...item };
  else store.push({ ...item });
}

/** Test — liste store doğrudan okuma */
export function getAgentsStoreSnapshot(): AgentListItem[] {
  return store.map((a) => ({ ...a }));
}

/** Test yardımcısı — filtre sonucu satır sayısı */
export function countByStatus(status: EntityStatusFilter): number {
  return visibleAgents().filter((a) => status === 'all' || a.status === status).length;
}
