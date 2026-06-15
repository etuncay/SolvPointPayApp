/**
 * Temsilci hesap API kısayolları — UI doğrudan bunları çağırır.
 * Geçişte yalnızca adapter (port) değişir; imza sabit kalır.
 */
import type { ListQueryInput } from '../contracts/list-query';
import type { PaginatedListResponse } from '../contracts/api-response';
import type { AgentBalanceRow } from '../types/account';
import { accountsApi } from '../services/accounts.service';

export const fetchAgentBalances = (): Promise<AgentBalanceRow[]> => accountsApi.listBalances();

export const fetchAgentActivitiesList = (params: ListQueryInput): Promise<PaginatedListResponse> =>
  accountsApi.listActivities(params);
