/**
 * Temsilci bireysel müşteri kaydı API kısayolları — UI doğrudan bunları çağırır.
 * Geçişte yalnızca adapter (port) değişir; imza sabit kalır.
 */
import type { AgentRegistrationRecord, AgentRegistrationSaveResult } from '../types/registration';
import { agentRegistrationApi } from '../services/registration.service';
import { registrationToFormValues } from '../domain/registration-mapper';

export { registrationToFormValues };

export const getAgentRegistrationById = (id: string): Promise<AgentRegistrationRecord | undefined> =>
  agentRegistrationApi.getById(id);

export const lookupAgentCustomerByIdentity = (
  idNo: string,
): Promise<AgentRegistrationRecord | undefined> => agentRegistrationApi.lookupByIdentityNo(idNo);

export const hasAgentPendingTransfer = (idNo: string): Promise<boolean> =>
  agentRegistrationApi.hasPendingTransfer(idNo);

export const saveAgentRegistration = (
  values: Record<string, unknown>,
  opts: { draft: boolean },
): Promise<AgentRegistrationSaveResult> => agentRegistrationApi.save(values, opts);
